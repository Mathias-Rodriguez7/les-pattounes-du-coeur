import type { MediaType } from '@prisma/client';
import prisma from '$lib/server/prisma';
import type { UploadPurpose } from '$lib/media/rules';
import { UPLOAD_PURPOSE_CONFIG } from './purposes';
import { verifyUpload, deleteFiles } from '$lib/server/storage';

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
