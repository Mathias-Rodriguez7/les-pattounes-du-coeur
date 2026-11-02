// app/association/news/+page.server.ts
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { catListSelect } from '$lib/types/cat';

export const load: PageServerLoad = async ({ url }) => {
	const newsId = url.searchParams.get('news');

	const news = await prisma.news.findMany({
		select: {
			id: true,
			title: true,
			content: true,
			type: true,
			mediaUrl: true,
			createdAt: true,
			cats: {
				select: {
					cat: { select: catListSelect }
				}
			}
		}
	});

	return {
		news: news.map((n) => ({
			...n,
			cats: n.cats.map((nc) => nc.cat)
		})),
		selectedNewsId: newsId
	};
};
