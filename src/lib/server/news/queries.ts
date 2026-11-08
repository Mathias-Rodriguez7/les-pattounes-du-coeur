// src/lib/server/news/queries.ts
import type { Prisma } from '@prisma/client';
import { catListSelect } from '$lib/types/cat';
import { getPublicUrl } from '$lib/server/storage';
import type { NewsFull } from '$lib/types/news';

/** Ce que charge une news, dans le dashboard comme sur le site public */
export const newsListSelect = {
	id: true,
	title: true,
	content: true,
	type: true,
	createdAt: true,
	cats: { select: { cat: { select: catListSelect } } },
	// Jamais l'id ni isPrivate : seulement de quoi construire l'adresse et la carte
	media: { select: { storageKey: true, mimeType: true, sizeBytes: true, originalName: true } }
} satisfies Prisma.NewsSelect;

type NewsRow = Prisma.NewsGetPayload<{ select: typeof newsListSelect }>;

/** Ligne de la base → objet prêt pour la page (la storageKey ne part pas au navigateur) */
export function toNewsFull({ media, cats, ...news }: NewsRow): NewsFull {
	return {
		...news,
		cats: cats.map((nc) => nc.cat),
		mediaFile: media
			? {
					url: getPublicUrl(media.storageKey),
					mimeType: media.mimeType,
					sizeBytes: media.sizeBytes,
					name: media.originalName
				}
			: null
	};
}
