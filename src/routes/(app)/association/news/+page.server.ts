import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url }) => {
	const newsId = url.searchParams.get('news');

	const news = await prisma.news.findMany({
		orderBy: { createdAt: 'desc' },
		include: {
			cats: {
				include: {
					cat: {
						select: {
							id: true, // ← IMPORTANT
							name: true,
							catNumber: true,
							status: true,
							birthDate: true,
							description: true,
							media: true
						}
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
