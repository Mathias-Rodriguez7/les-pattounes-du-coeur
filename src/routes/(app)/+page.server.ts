import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	// News avec les cats associés - limité à 4
	const news = await prisma.news.findMany({
		take: 4,
		include: {
			cats: {
				include: {
					cat: true
				}
			}
		},
		orderBy: { created_at: 'desc' }
	});

	// Cats visibles - limité à 4
	const cats = await prisma.cat.findMany({
		take: 4,
		where: { isVisible: true },
		include: { media: true },
		orderBy: { created_at: 'desc' }
	});

	return {
		news,
		cats
	};
};
