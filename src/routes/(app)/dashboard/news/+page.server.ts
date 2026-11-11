// app/dashboard/news/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import prisma from '#lib/server/prisma.ts';
import { createNews, updateNews, deleteNews } from '#lib/server/news/mutations.ts';
import { canManageNews, canDeleteNews } from '#lib/permissions/news.ts';
import { fail, redirect } from '@sveltejs/kit';
import { newsListSelect, toNewsFull } from '#lib/server/news/queries.ts';
import { generateCatsNews, getNewsCatsCandidateIds } from '#lib/server/news/catsNews.ts';
import { generateCatsSchema } from '#lib/schemas/news.ts';

export const load: PageServerLoad = async ({ locals }) => {
	// Même règle que la barre latérale, mais appliquée par le serveur
	if (!locals.user) redirect(302, '/');
	if (!canManageNews(locals.user.role)) redirect(302, '/dashboard');

	const role = locals.user.role;
	const canManage = canManageNews(role);

	// Requêtes indépendantes → lancées en parallèle
	const [news, cats, adoptableCats, candidateIds] = await Promise.all([
		prisma.news.findMany({
			orderBy: { createdAt: 'desc' },
			select: newsListSelect
		}),
		// Liste des chats pour le formulaire d'édition : seulement pour ceux qui éditent,
		// et seulement les champs utiles (tout ce que renvoie le load part au navigateur)
		canManage
			? prisma.cat.findMany({
					select: { id: true, name: true, catNumber: true },
					orderBy: { catNumber: 'asc' }
				})
			: Promise.resolve([]),
		// « Générer une News chats » : les chats qu'on peut ajouter…
		canManage
			? prisma.cat.findMany({
					where: { isVisible: true, status: 'AVAILABLE' },
					select: { id: true, name: true, catNumber: true },
					orderBy: { catNumber: 'asc' }
				})
			: Promise.resolve([]),
		// … et ceux que la règle propose (pré-cochés)
		canManage ? getNewsCatsCandidateIds() : Promise.resolve([])
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
		news: news.map(toNewsFull),
		cats,
		adoptableCats,
		candidateIds,
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
			return fail(403, { success: false, error: 'Non autorisé', action: 'generateCats' });
		}

		const formData = await request.formData();
		const parsed = generateCatsSchema.safeParse({
			title: formData.get('title') ?? undefined,
			// getAll : une case cochée = une valeur « catIds »
			catIds: formData.getAll('catIds')
		});
		if (!parsed.success) {
			return fail(400, {
				success: false,
				error: parsed.error.issues[0]?.message ?? 'Sélection invalide',
				action: 'generateCats'
			});
		}

		try {
			const news = await generateCatsNews(parsed.data);
			if (!news) {
				return fail(400, {
					success: false,
					error: "Aucun des chats choisis n'est encore à l'adoption",
					action: 'generateCats'
				});
			}
			return {
				success: true,
				message: `News chats créée (${news._count.cats} chat${news._count.cats > 1 ? 's' : ''})`,
				action: 'generateCats'
			};
		} catch (error) {
			console.error('Erreur génération News chats:', error);
			return fail(500, {
				success: false,
				error: 'Erreur lors de la génération',
				action: 'generateCats'
			});
		}
	}
};
