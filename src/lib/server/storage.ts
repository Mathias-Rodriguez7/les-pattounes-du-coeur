// Seul point de contact avec le stockage S3 (RustFS en local, R2/Scaleway/AWS en prod).
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	DeleteObjectsCommand,
	type S3ClientConfig
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import type { MediaType } from '@prisma/client';
import { validateFile } from '$lib/media/rules';

// =====================================================================
// CONFIGURATION (lue au premier usage, pas au démarrage)
// =====================================================================

function required(name: string): string {
	const value = env[name];
	if (!value) throw new Error(`[storage] Variable d'environnement manquante : ${name}`);
	return value;
}

type Storage = {
	/** Pour les opérations du serveur (vérifier, supprimer) */
	client: S3Client;
	/** Uniquement pour SIGNER les URLs que le navigateur appellera */
	signer: S3Client;
	buckets: { public: string; private: string };
};

let storage: Storage | null = null;

function getStorage(): Storage {
	if (storage) return storage;

	const base: S3ClientConfig = {
		region: required('S3_REGION'),
		forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
		credentials: {
			accessKeyId: required('S3_ACCESS_KEY_ID'),
			secretAccessKey: required('S3_SECRET_ACCESS_KEY')
		},
		// Les sommes de contrôle automatiques du SDK ne sont pas gérées par tous les
		// fournisseurs compatibles S3 : on ne les envoie que quand c'est obligatoire.
		requestChecksumCalculation: 'WHEN_REQUIRED',
		responseChecksumValidation: 'WHEN_REQUIRED'
	};

	storage = {
		client: new S3Client({ ...base, endpoint: required('S3_ENDPOINT') }),
		signer: new S3Client({ ...base, endpoint: required('S3_PUBLIC_ENDPOINT') }),
		buckets: {
			public: required('S3_BUCKET_PUBLIC'),
			private: required('S3_BUCKET_PRIVATE')
		}
	};
	return storage;
}

const bucketFor = (isPrivate: boolean) =>
	isPrivate ? getStorage().buckets.private : getStorage().buckets.public;

// =====================================================================
// CLÉS
// =====================================================================

/** Les dossiers autorisés. TypeScript refuse tout autre chemin. */
export type StorageFolder =
	'news' | `cats/${string}/gallery` | `cats/${string}/documents` | `cats/${string}/cares` | 'info';

const EXTENSIONS: Record<string, string> = {
	'application/pdf': 'pdf',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'video/mp4': 'mp4',
	'video/webm': 'webm',
	'video/quicktime': 'mov',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
};

/** "cats/<id>/documents" + "application/pdf" → "cats/<id>/documents/<uuid>.pdf" */
export function buildStorageKey(folder: StorageFolder, mimeType: string): string {
	const extension = EXTENSIONS[mimeType] ?? 'bin';
	return `${folder}/${randomUUID()}.${extension}`;
}

// =====================================================================
// ENVOI (le navigateur envoie directement à S3)
// =====================================================================

const UPLOAD_URL_TTL = 5 * 60; // 5 minutes

export async function createUploadUrl(params: {
	folder: StorageFolder;
	mimeType: string;
	sizeBytes: number;
	isPrivate: boolean;
}): Promise<{ uploadUrl: string; storageKey: string }> {
	const storageKey = buildStorageKey(params.folder, params.mimeType);

	const command = new PutObjectCommand({
		Bucket: bucketFor(params.isPrivate),
		Key: storageKey,
		ContentType: params.mimeType,
		ContentLength: params.sizeBytes
	});

	const uploadUrl = await getSignedUrl(getStorage().signer, command, {
		expiresIn: UPLOAD_URL_TTL,
		// Le type et la taille font partie de la signature : impossible d'envoyer autre chose
		signableHeaders: new Set(['content-type', 'content-length'])
	});

	return { uploadUrl, storageKey };
}

// =====================================================================
// VÉRIFICATION APRÈS ENVOI
// =====================================================================

export type VerifiedUpload =
	{ ok: true; type: MediaType; mimeType: string; sizeBytes: number } | { ok: false; error: string };

/**
 * Ne jamais croire le navigateur : on demande à S3 ce qu'il a VRAIMENT reçu.
 * Si le fichier ne respecte pas les règles, il est supprimé.
 */
export async function verifyUpload(params: {
	storageKey: string;
	isPrivate: boolean;
	expectedFolder: StorageFolder;
	allowed: MediaType[];
	allowWord?: boolean;
}): Promise<VerifiedUpload> {
	const { storageKey, isPrivate, expectedFolder, allowed, allowWord } = params;

	// Empêche d'attacher un fichier qui appartient à un autre chat ou à une autre news
	if (!storageKey.startsWith(`${expectedFolder}/`) || storageKey.includes('..')) {
		return { ok: false, error: 'Clé de fichier invalide' };
	}

	let mimeType: string;
	let sizeBytes: number;

	try {
		const head = await getStorage().client.send(
			new HeadObjectCommand({ Bucket: bucketFor(isPrivate), Key: storageKey })
		);
		mimeType = head.ContentType ?? '';
		sizeBytes = head.ContentLength ?? 0;
	} catch (error) {
		const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
		if (status === 404) {
			return { ok: false, error: "Fichier introuvable : l'envoi n'a pas abouti" };
		}
		throw error;
	}

	const check = validateFile({ type: mimeType, size: sizeBytes }, allowed, { allowWord });
	if (!check.ok) {
		await deleteFiles([{ storageKey, isPrivate }]);
		return check;
	}

	return { ok: true, type: check.type, mimeType, sizeBytes };
}

// =====================================================================
// LECTURE
// =====================================================================

/** Adresse directe d'un fichier PUBLIC (pas de signature, ne périme pas) */
export function getPublicUrl(storageKey: string): string {
	const base = publicEnv.PUBLIC_MEDIA_BASE_URL;
	if (!base) throw new Error('[storage] Variable manquante : PUBLIC_MEDIA_BASE_URL');
	return `${base.replace(/\/$/, '')}/${storageKey}`;
}

const DOWNLOAD_URL_TTL = 5 * 60; // 5 minutes

/** URL temporaire pour lire un fichier PRIVÉ. À n'appeler qu'après avoir vérifié les droits. */
export async function createDownloadUrl(
	storageKey: string,
	options: { fileName?: string | null } = {}
): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: getStorage().buckets.private,
		Key: storageKey,
		// Nom proposé au téléchargement, et affichage dans le navigateur plutôt que téléchargement forcé
		ResponseContentDisposition: options.fileName
			? `inline; filename*=UTF-8''${encodeURIComponent(options.fileName)}`
			: 'inline'
	});

	return getSignedUrl(getStorage().signer, command, { expiresIn: DOWNLOAD_URL_TTL });
}

// =====================================================================
// SUPPRESSION
// =====================================================================

/**
 * Supprime des fichiers. Ne lève PAS d'erreur : c'est du nettoyage, appelé
 * APRÈS la suppression en base. Un échec laisse un fichier orphelin, pas une donnée cassée.
 */
export async function deleteFiles(
	files: { storageKey: string; isPrivate: boolean }[]
): Promise<void> {
	if (files.length === 0) return;

	// Range les clés par bucket : une requête par bucket, pas une par fichier
	const byBucket = new Map<string, string[]>();
	for (const file of files) {
		const bucket = bucketFor(file.isPrivate);
		byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), file.storageKey]);
	}

	for (const [bucket, keys] of byBucket) {
		// DeleteObjects accepte 1 000 clés maximum par appel
		for (let i = 0; i < keys.length; i += 1000) {
			const chunk = keys.slice(i, i + 1000);
			try {
				await getStorage().client.send(
					new DeleteObjectsCommand({
						Bucket: bucket,
						Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true }
					})
				);
			} catch (error) {
				console.error(
					`[storage] Suppression impossible (${chunk.length} fichier(s) dans ${bucket})`,
					error
				);
			}
		}
	}
}
