import { prisma } from '$lib/server/prisma';
import { mapNews } from '$lib/mappers/news';

export const load = async () => {
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
		news: news.map(mapNews)
	};
};
