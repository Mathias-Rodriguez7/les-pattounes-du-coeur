// app/association/news/+page.server.ts
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { newsListSelect, toNewsFull } from '$lib/server/news/queries';

export const load: PageServerLoad = async ({ url }) => {
	const newsId = url.searchParams.get('news');

	const news = await prisma.news.findMany({
		orderBy: { createdAt: 'desc' },
		select: newsListSelect
	});

	return {
		news: news.map(toNewsFull),
		selectedNewsId: newsId
	};
};
