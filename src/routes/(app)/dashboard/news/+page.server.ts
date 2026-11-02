// app/dashboard/news/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { catListSelect } from '$lib/types/cat';
import { createNews, updateNews, deleteNews, generateCatsNews } from '$lib/server/news/mutations';

export const load: PageServerLoad = async ({ locals }) => {
	const news = await prisma.news.findMany({
		orderBy: { createdAt: 'desc' },
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

	const stats = {
		total: news.length,
		news: news.filter((n) => n.type === 'NEWS').length,
		newsletters: news.filter((n) => n.type === 'NEWSLETTER').length,
		history: news.filter((n) => n.type === 'HISTORY').length,
		newscasts: news.filter((n) => n.type === 'NEWSCATS').length,
		events: news.filter((n) => n.type === 'EVENT').length
	};

	return {
		news: news.map((n) => ({
			...n,
			cats: n.cats.map((nc) => nc.cat)
		})),
		stats,
		// même logique que tes autres pages, adapte selon locals
		isAdmin: locals.user?.role === 'ADMIN'
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const result = await createNews({ request, locals });
		if (!result.success) {
			return fail(400, { ...result, action: 'create' });
		}
		return { ...result, action: 'create' };
	},

	update: async ({ request, locals }) => {
		const result = await updateNews({ request, locals });
		if (!result.success) {
			return fail(400, { ...result, action: 'update' });
		}
		return { ...result, action: 'update' };
	},

	delete: async ({ request, locals }) => {
		const result = await deleteNews({ request, locals });
		if (!result.success) {
			return fail(400, { ...result, action: 'delete' });
		}
		return { ...result, action: 'delete' };
	},

	generateCats: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'ADMIN') {
			return fail(403, {
				success: false,
				error: 'Non autorisé',
				errors: {},
				action: 'generateCats'
			});
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString();

		try {
			const news = await generateCatsNews({ title });
			return {
				success: true,
				message: 'News chats générée avec succès',
				data: news,
				errors: {},
				action: 'generateCats'
			};
		} catch (error) {
			console.error('Erreur génération News chats:', error);
			return fail(500, {
				success: false,
				error: 'Erreur lors de la génération',
				errors: {},
				action: 'generateCats'
			});
		}
	}
};
