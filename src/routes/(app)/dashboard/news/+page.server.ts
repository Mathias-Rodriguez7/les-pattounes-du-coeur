import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const news = await prisma.news.findMany({
		orderBy: { created_at: 'desc' },
		include: {
			cats: {
				include: { cat: { select: { id: true, name: true, catNumber: true, status: true } } }
			}
		}
	});

	const yearStart = new Date(new Date().getFullYear(), 0, 1);

	const stats = {
		total: news.length,
		newsletters: news.filter((n) => n.type === 'NEWSLETTER').length,
		events: news.filter((n) => n.type === 'EVENT').length,
		withoutMedia: news.filter((n) => !n.mediaUrl).length,
		thisYear: news.filter((n) => n.created_at >= yearStart).length
	};

	return {
		news,
		stats,
		// même logique que tes autres pages, adapte selon locals
		isAdmin: locals.volunteer?.role === 'ADMIN'
	};
};
