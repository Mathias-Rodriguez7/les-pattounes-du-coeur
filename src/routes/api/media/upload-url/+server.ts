import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { UPLOAD_PURPOSES, validateFile } from '#lib/media/rules.ts';
import { UPLOAD_PURPOSE_CONFIG } from '#lib/server/media/purposes.ts';
import { createUploadUrl } from '#lib/server/storage.ts';

const bodySchema = z.object({
	purpose: z.enum(UPLOAD_PURPOSES),
	targetId: z.string().uuid().optional(),
	mimeType: z.string().min(1).max(100),
	sizeBytes: z.number().int().positive()
});

export const POST: RequestHandler = async ({ request, locals }) => {
	// 1. Connecté ?
	if (!locals.user) error(401, 'Vous devez être connecté');

	// 2. Demande bien formée ? (.catch : un corps qui n'est pas du JSON donne null, donc 400)
	const parsed = bodySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) error(400, 'Requête invalide');

	const { purpose, targetId, mimeType, sizeBytes } = parsed.data;
	const config = UPLOAD_PURPOSE_CONFIG[purpose];

	if (config.needsTarget && !targetId) error(400, 'Cible manquante');
	const target = targetId ?? '';

	// 3. A-t-il le droit ?
	if (!(await config.canUpload(locals.user, target))) {
		error(403, "Vous n'avez pas le droit d'envoyer ce fichier");
	}

	// 4. Le fichier annoncé respecte-t-il les règles ?
	const check = validateFile({ type: mimeType, size: sizeBytes }, config.allowed, {
		allowWord: config.allowWord
	});
	if (!check.ok) error(400, check.error);

	// 5. Le SERVEUR choisit le bucket et le dossier
	const { uploadUrl, storageKey } = await createUploadUrl({
		folder: config.folder(target),
		mimeType,
		sizeBytes,
		isPrivate: config.isPrivate
	});

	return json({ uploadUrl, storageKey });
};
