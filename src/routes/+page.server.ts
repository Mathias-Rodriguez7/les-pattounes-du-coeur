import { prisma } from '$lib/server/prisma';
import { mapCat } from '$lib/mappers/cats';
import { mapNews } from '$lib/mappers/news';

export async function load() {
	const cats = await prisma.cat.findMany({
		where: {
			isVisible: true
		},
		include: {
			media: true
		},
		orderBy: {
			created_at: 'desc'
		},
		take: 4
	});

	const news = await prisma.news.findMany({
		orderBy: { created_at: 'desc' },
		take: 4,
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
		cats: cats.map(mapCat),
		news: news.map(mapNews)
	};
}
