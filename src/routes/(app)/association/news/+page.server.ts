import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url }) => {
	const newsId = url.searchParams.get('news');

	const news = await prisma.news.findMany({
		orderBy: { created_at: 'desc' },
		include: {
			cats: {
				include: {
					cat: {
						include: { media: true }
					}
				}
			}
		}
	});

	return {
		news,
		selectedNewsId: newsId
	};
};
