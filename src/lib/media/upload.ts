// Envoi d'un fichier du navigateur vers S3, en deux temps :
// 1. on demande une URL signée à NOTRE serveur
// 2. on envoie le fichier DIRECTEMENT à S3 avec cette URL
import type { UploadPurpose } from './rules';

export class UploadError extends Error {
	constructor(
		message: string,
		public readonly reason: 'refused' | 'network' | 'aborted' = 'refused'
	) {
		super(message);
		this.name = 'UploadError';
	}
}

/** Ce que le formulaire renverra au serveur (qui revérifiera tout) */
export type UploadedFile = {
	storageKey: string;
	originalName: string;
	mimeType: string;
	sizeBytes: number;
};

/** Identifiant d'un fichier choisi : pour les doublons et les barres de progression */
export const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

// ===== Étape 1 : demander l'autorisation à notre serveur =====
async function requestUploadUrl(
	file: File,
	purpose: UploadPurpose,
	targetId: string | undefined,
	signal?: AbortSignal
): Promise<{ uploadUrl: string; storageKey: string }> {
	let response: Response;
	try {
		response = await fetch('/api/media/upload-url', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ purpose, targetId, mimeType: file.type, sizeBytes: file.size }),
			signal
		});
	} catch {
		if (signal?.aborted) throw new UploadError('Envoi annulé', 'aborted');
		throw new UploadError('Serveur injoignable', 'network');
	}

	if (!response.ok) {
		// Les erreurs de l'endpoint sont au format { message: "…" }
		const body = (await response.json().catch(() => null)) as { message?: string } | null;
		throw new UploadError(body?.message ?? `Envoi refusé (code ${response.status})`);
	}

	return response.json();
}

// ===== Étape 2 : envoyer le fichier à S3 =====
// XMLHttpRequest et pas fetch : fetch ne sait pas suivre la progression d'un ENVOI
function putToStorage(
	url: string,
	file: File,
	onProgress?: (percent: number) => void,
	signal?: AbortSignal
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', url);
		// Doit être identique au type signé par le serveur.
		// Content-Length, lui, est ajouté automatiquement par le navigateur.
		xhr.setRequestHeader('Content-Type', file.type);

		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(new UploadError(`Le stockage a refusé le fichier (code ${xhr.status})`));
		};
		xhr.onerror = () => reject(new UploadError("Connexion perdue pendant l'envoi", 'network'));
		xhr.onabort = () => reject(new UploadError('Envoi annulé', 'aborted'));

		signal?.addEventListener('abort', () => xhr.abort(), { once: true });
		xhr.send(file);
	});
}

// ===== La fonction à utiliser =====
export async function uploadFile(
	file: File,
	options: {
		purpose: UploadPurpose;
		/** L'id du chat, pour catDocument, careDocument et catGallery */
		targetId?: string;
		onProgress?: (percent: number) => void;
		/** Pour pouvoir annuler (bouton Annuler, fermeture de la fenêtre…) */
		signal?: AbortSignal;
	}
): Promise<UploadedFile> {
	const { purpose, targetId, onProgress, signal } = options;

	onProgress?.(0);
	const { uploadUrl, storageKey } = await requestUploadUrl(file, purpose, targetId, signal);
	await putToStorage(uploadUrl, file, onProgress, signal);
	onProgress?.(100);

	return {
		storageKey,
		originalName: file.name,
		mimeType: file.type,
		sizeBytes: file.size
	};
}
