import type { MediaType } from '@prisma/client';
import prisma from '#lib/server/prisma.ts';
import type { UploadPurpose } from '#lib/media/rules.ts';
import { UPLOAD_PURPOSE_CONFIG } from './purposes';
import { verifyUpload, deleteFiles } from '#lib/server/storage.ts';
import type { AppUser } from '#lib/types/user.ts';

/** Les champs d'une ligne Media, prêts pour un `create` imbriqué */
export type MediaData = {
	type: MediaType;
	storageKey: string;
	mimeType: string;
	sizeBytes: number;
	originalName: string | null;
	isPrivate: boolean;
};

/**
 * Vérifie un fichier envoyé par le navigateur, puis prépare sa ligne Media.
 * Ne touche PAS à la base : la création se fait dans la requête de l'entité (news, chat…).
 */
export async function prepareMedia(
	purpose: UploadPurpose,
	file: { storageKey: string; originalName?: string | null },
	targetId = ''
): Promise<{ ok: true; data: MediaData } | { ok: false; error: string }> {
	const config = UPLOAD_PURPOSE_CONFIG[purpose];

	const verified = await verifyUpload({
		storageKey: file.storageKey,
		isPrivate: config.isPrivate,
		expectedFolder: config.folder(targetId),
		allowWord: config.allowWord,
		allowed: config.allowed
	});
	if (!verified.ok) return verified;

	return {
		ok: true,
		data: {
			type: verified.type,
			storageKey: file.storageKey,
			mimeType: verified.mimeType,
			sizeBytes: verified.sizeBytes,
			originalName: file.originalName?.slice(0, 255) || null,
			isPrivate: config.isPrivate
		}
	};
}

/** Supprime des lignes Media, PUIS leurs fichiers sur S3 */
export async function deleteMedia(
	medias: { id: string; storageKey: string; isPrivate: boolean }[]
) {
	if (medias.length === 0) return;

	await prisma.media.deleteMany({ where: { id: { in: medias.map((m) => m.id) } } });
	await deleteFiles(medias.map(({ storageKey, isPrivate }) => ({ storageKey, isPrivate })));
}

/**
 * Supprime des fichiers envoyés sur S3 mais jamais rattachés à une entité
 * (la création a échoué, ou la demande a été refusée après l'envoi).
 *
 * À appeler APRÈS avoir vérifié le droit sur la cible (chat, news…).
 * Les clés viennent du navigateur : on ne les croit pas sur parole.
 * - on ne garde que les clés du dossier attendu (pas le fichier d'un autre chat) ;
 * - on écarte celles qu'une ligne Media utilise (de vrais documents : on n'y touche pas).
 *
 * Ne lève jamais d'erreur : un nettoyage raté ne doit pas cacher l'erreur d'origine.
 */
export async function discardUploads(
	purpose: UploadPurpose,
	storageKeys: string[],
	targetId = ''
): Promise<void> {
	if (storageKeys.length === 0) return;
	const config = UPLOAD_PURPOSE_CONFIG[purpose];
	const folder = `${config.folder(targetId)}/`;

	try {
		const inFolder = storageKeys.filter((key) => key.startsWith(folder) && !key.includes('..'));
		if (inFolder.length === 0) return;

		// Une seule requête pour toutes les clés
		const used = await prisma.media.findMany({
			where: { storageKey: { in: inFolder } },
			select: { storageKey: true }
		});
		const usedKeys = new Set(used.map((m) => m.storageKey));
		const orphans = inFolder.filter((key) => !usedKeys.has(key));

		await deleteFiles(orphans.map((storageKey) => ({ storageKey, isPrivate: config.isPrivate })));
	} catch (error) {
		console.error('discardUploads : nettoyage impossible', error);
	}
}

/**
 * La même chose pour UN fichier, quand le droit n'a pas encore été vérifié
 * (ex. : l'action d'adoption refuse la demande avant de contrôler le chat).
 */
export async function discardUpload(
	user: AppUser,
	purpose: UploadPurpose,
	storageKey: string,
	targetId = ''
): Promise<void> {
	try {
		if (!(await UPLOAD_PURPOSE_CONFIG[purpose].canUpload(user, targetId))) return;
	} catch (error) {
		console.error('discardUpload : vérification du droit impossible', error);
		return;
	}
	await discardUploads(purpose, [storageKey], targetId);
}
