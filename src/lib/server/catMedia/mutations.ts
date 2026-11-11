import { z } from 'zod';
import prisma from '$lib/server/prisma';
import { canManageCat } from '$lib/server/permissions/cat';
import { prepareMedia, deleteMedia } from '$lib/server/media/mutations';
import { deleteFiles } from '$lib/server/storage';

const MAX_FILES_PER_UPLOAD = 10;

type Result = {
	success: boolean;
	message?: string;
	error?: string;
	errors?: Record<string, string[] | undefined>;
};

type Args = { request: Request; locals: App.Locals };

/**
 * Lit un média de la galerie ET vérifie les droits sur SON chat (lu en base).
 * Renvoie null si l'id est invalide, si le média n'existe pas, ou sans droits.
 */
async function getManageableMedia(user: App.Locals['user'], mediaId: unknown) {
	const id = z.string().uuid().safeParse(mediaId);
	if (!user || !id.success) return null;

	const media = await prisma.mediaCat.findUnique({
		where: { id: id.data },
		include: { file: true }
	});
	if (!media || !(await canManageCat(user, media.catId))) return null;

	return media;
}

// ==========================================
// ADD - Ajouter des photos ou des vidéos
// ==========================================
export async function addCatMedia({ request, locals }: Args): Promise<Result> {
	if (!locals.user) return { success: false, error: 'Non autorisé' };

	const formData = await request.formData();
	const parsedCatId = z.string().uuid().safeParse(formData.get('catId'));
	if (!parsedCatId.success) return { success: false, error: 'Chat invalide' };
	const catId = parsedCatId.data;

	if (!(await canManageCat(locals.user, catId))) {
		return { success: false, error: "Vous n'avez pas le droit de modifier la galerie de ce chat" };
	}

	// Plusieurs fichiers : même méthode que pour les soins
	const keys = formData.getAll('mediaStorageKey').map(String);
	const names = formData.getAll('mediaOriginalName').map(String);
	const cleanUp = () => deleteFiles(keys.map((storageKey) => ({ storageKey, isPrivate: false })));

	if (keys.length === 0) return { success: false, error: 'Aucun fichier envoyé' };
	if (keys.length > MAX_FILES_PER_UPLOAD) {
		await cleanUp();
		return { success: false, error: `${MAX_FILES_PER_UPLOAD} fichiers maximum à la fois` };
	}

	const prepared = await Promise.all(
		keys.map((storageKey, i) =>
			prepareMedia('catGallery', { storageKey, originalName: names[i] }, catId)
		)
	);
	const failed = prepared.find((p) => !p.ok);
	if (failed && !failed.ok) {
		await cleanUp();
		return { success: false, error: failed.error, errors: { media: [failed.error] } };
	}
	const medias = prepared.flatMap((p) => (p.ok ? [p.data] : []));

	try {
		await prisma.$transaction(async (tx) => {
			// Si le chat n'a pas encore de photo principale, la 1re PHOTO ajoutée le devient
			let hasPrimary = (await tx.mediaCat.count({ where: { catId, isPrimary: true } })) > 0;

			for (const media of medias) {
				const becomesPrimary = !hasPrimary && media.type === 'IMAGE';
				if (becomesPrimary) hasPrimary = true;

				await tx.mediaCat.create({
					data: {
						cat: { connect: { id: catId } },
						isPrimary: becomesPrimary,
						file: { create: media }
					}
				});
			}
		});
	} catch (error) {
		console.error('Erreur ajout galerie:', error);
		await cleanUp();
		return { success: false, error: "Erreur lors de l'enregistrement des fichiers" };
	}

	return {
		success: true,
		message: medias.length > 1 ? `${medias.length} fichiers ajoutés` : 'Fichier ajouté'
	};
}

// ==========================================
// PRIMARY - Changer la photo principale
// ==========================================
export async function setPrimaryCatMedia({ request, locals }: Args): Promise<Result> {
	const formData = await request.formData();
	const media = await getManageableMedia(locals.user, formData.get('mediaId'));
	if (!media) return { success: false, error: 'Photo introuvable' };

	if (media.file.type !== 'IMAGE') {
		return { success: false, error: 'Seule une photo peut être la photo principale' };
	}
	if (media.isPrimary) return { success: true, message: 'Déjà la photo principale' };

	// Les deux opérations ensemble : jamais zéro, ni deux photos principales
	await prisma.$transaction([
		prisma.mediaCat.updateMany({
			where: { catId: media.catId, isPrimary: true },
			data: { isPrimary: false }
		}),
		prisma.mediaCat.update({ where: { id: media.id }, data: { isPrimary: true } })
	]);

	return { success: true, message: 'Photo principale modifiée' };
}

// ==========================================
// DELETE - Supprimer une photo ou une vidéo
// ==========================================
export async function deleteCatMedia({ request, locals }: Args): Promise<Result> {
	const formData = await request.formData();
	const media = await getManageableMedia(locals.user, formData.get('mediaId'));
	if (!media) return { success: false, error: 'Fichier introuvable' };

	await prisma.$transaction(async (tx) => {
		await tx.mediaCat.delete({ where: { id: media.id } });

		// La photo principale disparaît : la plus ancienne des photos restantes la remplace
		if (media.isPrimary) {
			const next = await tx.mediaCat.findFirst({
				where: { catId: media.catId, file: { type: 'IMAGE' } },
				orderBy: { createdAt: 'asc' }
			});
			if (next) {
				await tx.mediaCat.update({ where: { id: next.id }, data: { isPrimary: true } });
			}
		}
	});

	// Puis la ligne Media et le fichier sur S3
	await deleteMedia([media.file]);

	return { success: true, message: 'Fichier supprimé' };
}

// ==========================================
// FOCAL - Point focal d'une photo
// ==========================================
const percent = z.coerce.number().min(0).max(100);

export async function updateCatMediaFocalPoint({ request, locals }: Args): Promise<Result> {
	const formData = await request.formData();
	const media = await getManageableMedia(locals.user, formData.get('mediaId'));
	if (!media) return { success: false, error: 'Photo introuvable' };

	if (media.file.type !== 'IMAGE') {
		return { success: false, error: 'Le point focal ne concerne que les photos' };
	}

	const x = percent.safeParse(formData.get('focalPointX'));
	const y = percent.safeParse(formData.get('focalPointY'));
	if (!x.success || !y.success) {
		return { success: false, error: 'Le point focal doit être compris entre 0 et 100' };
	}

	await prisma.mediaCat.update({
		where: { id: media.id },
		// Arrondi au dixième : plus précis que l'œil, inutile de stocker 47.38291…
		data: {
			focalPointX: Math.round(x.data * 10) / 10,
			focalPointY: Math.round(y.data * 10) / 10
		}
	});

	return { success: true, message: 'Point focal enregistré' };
}
