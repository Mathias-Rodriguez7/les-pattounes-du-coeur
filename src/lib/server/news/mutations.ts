import prisma from '$lib/server/prisma';
import {
	createNewsSchema,
	updateNewsSchema,
	type CreateNewsInput,
	type UpdateNewsInput
} from '$lib/schemas/news';
import { canManageNews, canDeleteNews } from '$lib/permissions/news';

const NEWS_FIELDS = ['title', 'type', 'content', 'mediaUrl'] as const;

function convertFormData(formData: FormData): Record<string, string | string[] | null> {
	const data: Record<string, string | string[] | null> = {};

	for (const [key, value] of formData.entries()) {
		if (key === 'catIds') {
			// Gérer les catIds comme array
			if (!data.catIds) data.catIds = [];
			(data.catIds as string[]).push(value as string);
		} else {
			data[key] = (value as string) || null;
		}
	}

	return data;
}

// ✅ Helper pour construire les données de la News
function buildNewsData(data: CreateNewsInput | UpdateNewsInput) {
	return NEWS_FIELDS.reduce(
		(acc, field) => {
			if (field in data && data[field as keyof typeof data] !== undefined) {
				acc[field] = data[field as keyof typeof data];
			}
			return acc;
		},
		{} as Record<string, unknown>
	);
}

// ✅ Chats éligibles pour une news NEWSCATS
async function getEligibleCatIds(): Promise<string[]> {
	const cats = await prisma.cat.findMany({
		where: {
			isVisible: true,
			status: 'AVAILABLE'
		},
		select: { id: true }
	});

	return cats.map((c) => c.id);
}

export async function createNews({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.user || !canManageNews(locals.user.role)) {
		return {
			success: false,
			error: 'Non autorisé',
			errors: {}
		};
	}

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		// Parser catIds
		const catIds = (data.catIds as string[]) || [];
		const parsedData = {
			...data,
			catIds
		};

		// Valider les données
		const result = createNewsSchema.safeParse(parsedData);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: result.error.flatten().fieldErrors
			};
		}

		const validatedData: CreateNewsInput = result.data;

		// Pour NEWSCATS : pas de PDF, et les chats viennent de la BDD
		const isCatsNews = validatedData.type === 'NEWSCATS';
		const finalCatIds = isCatsNews ? await getEligibleCatIds() : validatedData.catIds;
		const mediaUrl = isCatsNews ? null : (validatedData.mediaUrl ?? null);

		const newNews = await prisma.news.create({
			data: {
				title: validatedData.title,
				type: validatedData.type,
				content: validatedData.content ?? null,
				mediaUrl,

				...(finalCatIds.length > 0 && {
					cats: {
						create: finalCatIds.map((catId) => ({
							catId
						}))
					}
				})
			},
			include: {
				cats: {
					include: {
						cat: true
					}
				}
			}
		});

		return {
			success: true,
			message: 'News créée avec succès',
			data: newNews,
			errors: {}
		};
	} catch (error) {
		console.error('Erreur création News:', error);
		return {
			success: false,
			error: 'Erreur lors de la création',
			errors: {}
		};
	}
}

export async function updateNews({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.user || !canManageNews(locals.user.role)) {
		return {
			success: false,
			error: 'Non autorisé',
			errors: {}
		};
	}

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		const newsId = data.newsId as string;

		if (!newsId) {
			return {
				success: false,
				error: 'ID de la news manquant',
				errors: {}
			};
		}

		// Parser catIds
		const catIds = (data.catIds as string[]) || [];
		const parsedData = {
			...data,
			catIds
		};

		// Valider les données
		const result = updateNewsSchema.safeParse(parsedData);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: result.error.flatten().fieldErrors
			};
		}

		const validatedData: UpdateNewsInput = result.data;

		const existingNews = await prisma.news.findUnique({
			where: { id: newsId },
			include: { cats: true }
		});

		if (!existingNews) {
			return {
				success: false,
				error: 'News non trouvée',
				errors: {}
			};
		}

		// Le type FINAL compte (il peut avoir changé dans le formulaire)
		const finalType = validatedData.type ?? existingNews.type;
		const isCatsNews = finalType === 'NEWSCATS';
		const newsData = buildNewsData(validatedData);

		// Une News chats n'a jamais de document
		if (isCatsNews) newsData.mediaUrl = null;

		const updatedNews = await prisma.news.update({
			where: { id: newsId },
			data: {
				...newsData,
				// Les chats ne concernent que les News chats : pour les autres types, on n'y touche pas
				...(isCatsNews && {
					cats: {
						deleteMany: {},
						create: (validatedData.catIds ?? []).map((catId) => ({ catId }))
					}
				})
			},
			include: {
				cats: { include: { cat: true } }
			}
		});

		return {
			success: true,
			message: 'News mise à jour avec succès',
			data: updatedNews,
			errors: {}
		};
	} catch (error) {
		console.error('Erreur mise à jour News:', error);
		return {
			success: false,
			error: 'Erreur lors de la mise à jour',
			errors: {}
		};
	}
}

export async function deleteNews({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.user || !canDeleteNews(locals.user.role)) {
		return {
			success: false,
			error: 'Non autorisé',
			errors: {}
		};
	}

	try {
		const formData = await request.formData();
		const newsId = formData.get('newsId') as string;

		if (!newsId) {
			return {
				success: false,
				error: 'ID manquant',
				errors: {}
			};
		}

		const existingNews = await prisma.news.findUnique({
			where: { id: newsId }
		});

		if (!existingNews) {
			return {
				success: false,
				error: 'News non trouvée',
				errors: {}
			};
		}

		// Supprimer les relations NewsCat d'abord
		await prisma.newsCat.deleteMany({
			where: { newsId }
		});

		// Puis supprimer la News
		await prisma.news.delete({
			where: { id: newsId }
		});

		return {
			success: true,
			message: 'News supprimée avec succès',
			errors: {}
		};
	} catch (error) {
		console.error('Erreur suppression News:', error);
		return {
			success: false,
			error: 'Erreur lors de la suppression',
			errors: {}
		};
	}
}

// ✅ Génération automatique (cron du dimanche) ou manuelle depuis l'admin
export async function generateCatsNews({ title }: { title?: string } = {}) {
	const catIds = await getEligibleCatIds();

	const now = new Date();
	const defaultTitle = `Les chats à l'adoption – semaine du ${now.toLocaleDateString('fr-FR', {
		timeZone: 'Europe/Paris'
	})}`;

	return prisma.news.create({
		data: {
			title: title?.trim() || defaultTitle,
			type: 'NEWSCATS',
			content: null,
			mediaUrl: null,
			cats: {
				create: catIds.map((catId) => ({ catId }))
			}
		},
		include: {
			cats: { include: { cat: true } }
		}
	});
}
