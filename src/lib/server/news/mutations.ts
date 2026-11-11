import prisma from '#lib/server/prisma.ts';
import {
	createNewsSchema,
	updateNewsSchema,
	type CreateNewsInput,
	type UpdateNewsInput
} from '#lib/schemas/news.ts';
import { canManageNews, canDeleteNews } from '#lib/permissions/news.ts';
import {
	prepareMedia,
	deleteMedia,
	discardUploads,
	type MediaData
} from '#lib/server/media/mutations.ts';
const NEWS_FIELDS = ['title', 'type', 'content'] as const;

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

export async function createNews({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.user || !canManageNews(locals.user.role)) {
		return {
			success: false,
			error: 'Non autorisé',
			errors: {}
		};
	}
	// Clé du fichier vérifié : à supprimer de S3 si la création échoue ensuite
	let uploadedKey: string | null = null;

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		// Valider les données
		const result = createNewsSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: result.error.flatten().fieldErrors
			};
		}

		const validatedData: CreateNewsInput = result.data;

		// 🆕 Une News chats a son propre chemin (generateCatsNews) : ici, jamais
		if (validatedData.type === 'NEWSCATS') {
			return {
				success: false,
				error: 'Utilisez le bouton « Générer » pour créer une News chats',
				errors: { type: ['Type non autorisé ici'] }
			};
		}

		// Document facultatif
		let media: MediaData | null = null;
		if (validatedData.mediaStorageKey) {
			const prepared = await prepareMedia('news', {
				storageKey: validatedData.mediaStorageKey,
				originalName: validatedData.mediaOriginalName
			});
			if (!prepared.ok) {
				return { success: false, error: prepared.error, errors: { media: [prepared.error] } };
			}
			media = prepared.data;
			uploadedKey = media.storageKey;
		}

		// 🆕 Plus de chats ici : seules les News chats en ont
		const newNews = await prisma.news.create({
			data: {
				title: validatedData.title,
				type: validatedData.type,
				content: validatedData.content ?? null,
				// La news et sa ligne Media sont créées ensemble
				...(media && { media: { create: media } })
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
		// Le fichier est sur S3 mais la news n'a pas été créée : on le supprime
		if (uploadedKey) await discardUploads('news', [uploadedKey]);
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

	// Clé du fichier vérifié : à supprimer de S3 si la mise à jour échoue ensuite
	let uploadedKey: string | null = null;

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

		// Parser catIds (une case cochée = une valeur)
		const catIds = (data.catIds as string[]) || [];

		// Valider les données
		const result = updateNewsSchema.safeParse({ ...data, catIds });

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
			include: { media: true }
		});

		if (!existingNews) {
			return {
				success: false,
				error: 'News non trouvée',
				errors: {}
			};
		}

		// 🆕 Une News chats reste une News chats, et une news « classique » ne peut pas en devenir une
		const wasCatsNews = existingNews.type === 'NEWSCATS';
		if (validatedData.type && (validatedData.type === 'NEWSCATS') !== wasCatsNews) {
			return {
				success: false,
				error: "Le type d'une News chats ne peut pas être changé",
				errors: { type: ['Changement de type impossible'] }
			};
		}

		// 🆕 Une News chats doit garder au moins un chat
		if (wasCatsNews && catIds.length === 0) {
			return {
				success: false,
				error: 'Une News chats doit contenir au moins un chat',
				errors: { catIds: ['Choisissez au moins un chat'] }
			};
		}

		const newsData = buildNewsData(validatedData);

		// ===== Document (jamais pour une News chats) =====
		const oldMedia = existingNews.media;
		let mediaChange: { create: MediaData } | { disconnect: true } | undefined;
		let deleteOldMedia = false;

		if (!wasCatsNews && validatedData.mediaStorageKey) {
			// Nouveau document : il remplace l'ancien (même si « Retirer » a été cliqué avant)
			const prepared = await prepareMedia('news', {
				storageKey: validatedData.mediaStorageKey,
				originalName: validatedData.mediaOriginalName
			});
			if (!prepared.ok) {
				return { success: false, error: prepared.error, errors: { media: [prepared.error] } };
			}
			uploadedKey = prepared.data.storageKey;
			mediaChange = { create: prepared.data };
			deleteOldMedia = oldMedia !== null;
		} else if (!wasCatsNews && validatedData.removeMedia && oldMedia) {
			// « Retirer ce document », sans nouveau fichier
			mediaChange = { disconnect: true };
			deleteOldMedia = true;
		}

		const updatedNews = await prisma.news.update({
			where: { id: newsId },
			data: {
				...newsData,
				...(mediaChange && { media: mediaChange }),
				// Les chats ne concernent que les News chats : pour les autres, on n'y touche pas
				...(wasCatsNews && {
					cats: {
						deleteMany: {},
						create: catIds.map((catId) => ({ catId }))
					}
				})
			}
		});

		// L'ancien document n'est plus utilisé : on supprime sa ligne et son fichier
		if (deleteOldMedia && oldMedia) await deleteMedia([oldMedia]);

		return {
			success: true,
			message: 'News mise à jour avec succès',
			data: updatedNews,
			errors: {}
		};
	} catch (error) {
		console.error('Erreur mise à jour News:', error);
		if (uploadedKey) await discardUploads('news', [uploadedKey]);
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
			where: { id: newsId },
			include: { media: true }
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

		// Puis son document (ligne Media + fichier sur S3)
		if (existingNews.media) await deleteMedia([existingNews.media]);

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
