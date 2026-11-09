import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { catListSelect } from '$lib/types/cat';
import { newsCardSelect } from '$lib/server/news/queries';

export const load: PageServerLoad = async () => {
	// News avec les cats associés - limité à 4
	const news = await prisma.news.findMany({
		take: 4,
		select: newsCardSelect,
		orderBy: { createdAt: 'desc' }
	});

	// Cats visibles - limité à 4
	const cats = await prisma.cat.findMany({
		take: 4,
		where: { isVisible: true },
		select: catListSelect,
		orderBy: { createdAt: 'desc' }
	});

	return {
		news,
		cats
	};
};
