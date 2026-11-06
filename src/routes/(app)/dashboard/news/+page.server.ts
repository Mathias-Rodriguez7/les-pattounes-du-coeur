// app/dashboard/news/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { catListSelect } from '$lib/types/cat';
import { createNews, updateNews, deleteNews, generateCatsNews } from '$lib/server/news/mutations';
import { canManageNews, canDeleteNews } from '$lib/permissions/news';
import { getPublicUrl } from '$lib/server/storage';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Même règle que la barre latérale, mais appliquée par le serveur
	if (!locals.user) redirect(302, '/');
	if (!canManageNews(locals.user.role)) redirect(302, '/dashboard');

	const role = locals.user.role;
	const canManage = canManageNews(role);

	// Requêtes indépendantes → lancées en parallèle
	const [news, cats] = await Promise.all([
		prisma.news.findMany({
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
				},
				media: {
					select: { storageKey: true, mimeType: true, sizeBytes: true, originalName: true }
				}
			}
		}),
		// Liste des chats pour le formulaire d'édition : seulement pour ceux qui éditent,
		// et seulement les champs utiles (tout ce que renvoie le load part au navigateur)
		canManage
			? prisma.cat.findMany({
					select: { id: true, name: true, catNumber: true },
					orderBy: { catNumber: 'asc' }
				})
			: Promise.resolve([])
	]);

	const stats = {
		total: news.length,
		news: news.filter((n) => n.type === 'NEWS').length,
		newsletters: news.filter((n) => n.type === 'NEWSLETTER').length,
		history: news.filter((n) => n.type === 'HISTORY').length,
		newscasts: news.filter((n) => n.type === 'NEWSCATS').length,
		events: news.filter((n) => n.type === 'EVENT').length
	};

	return {
		news: news.map(({ media, ...n }) => ({
			...n,
			cats: n.cats.map((nc) => nc.cat),
			mediaFile: media
				? {
						url: getPublicUrl(media.storageKey),
						mimeType: media.mimeType,
						sizeBytes: media.sizeBytes,
						name: media.originalName
					}
				: null
		})),
		cats,
		stats,
		canManageNews: canManage,
		canDeleteNews: canDeleteNews(role)
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
		if (!locals.user || !canManageNews(locals.user.role)) {
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
