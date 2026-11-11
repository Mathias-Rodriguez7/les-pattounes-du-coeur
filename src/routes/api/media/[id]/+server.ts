import { error } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';
import { createDownloadUrl, getPublicUrl } from '$lib/server/storage';

const idSchema = z.string().uuid();

export const GET: RequestHandler = async ({ params, locals, url }) => {
	if (!locals.user) error(401, 'Vous devez être connecté');

	// 2. Un id mal formé ne doit pas aller jusqu'à la base
	if (!idSchema.safeParse(params.id).success) error(404, 'Document introuvable');

	// 3. Le document existe-t-il ?
	const media = await prisma.media.findUnique({
		where: { id: params.id },
		select: { storageKey: true, isPrivate: true, originalName: true }
	});
	if (!media) error(404, 'Document introuvable');

	// 4. Fichier public : pas besoin de signature
	const location = media.isPrivate
		? await createDownloadUrl(media.storageKey, {
				fileName: media.originalName,
				download: url.searchParams.get('download') === '1'
			})
		: getPublicUrl(media.storageKey);

	// 5. Redirection vers le fichier
	return new Response(null, {
		status: 302,
		headers: {
			Location: location,
			// Une URL signée expire : ni le navigateur ni un proxy ne doivent garder cette redirection
			'Cache-Control': 'private, no-store'
		}
	});
};
