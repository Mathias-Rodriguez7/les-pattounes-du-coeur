// src/lib/server/cares/mutations.ts
import { z } from 'zod';
import type { CareType, Prisma, Vaccinate } from '@prisma/client';
import prisma from '#lib/server/prisma.ts';
import { createCareSchema } from '#lib/schemas/care.ts';
import { canManageCat } from '#lib/server/permissions/cat.ts';
import { prepareMedia, deleteMedia, discardUploads } from '#lib/server/media/mutations.ts';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';

const MAX_DOCUMENTS = 5;

type Result = {
	success: boolean;
	message?: string;
	error?: string;
	errors?: Record<string, string[] | undefined>;
};

/** Ce qu'un soin change sur la fiche du chat */
function healthUpdateFor(
	type: CareType,
	currentVaccinate: Vaccinate | null
): Prisma.CatUpdateInput {
	switch (type) {
		case 'STERILIZE':
			return { isSterilize: true };
		case 'DEWORMING':
			return { isDeworming: true };
		case 'FIV_TEST':
			return { isFivTest: true };
		case 'IDENTIFICATION':
			return { isIdentify: true };
		case 'VACCINE':
			// Une injection ne suffit pas toujours : « Partiel », sauf si le chat est déjà à jour
			return currentVaccinate === 'YES' ? {} : { vaccinate: 'PARTIAL' };
		default:
			return {};
	}
}

// ==========================================
// CREATE - Ajouter un soin (et ses documents véto)
// ==========================================
export async function createCare({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}): Promise<Result> {
	// 1. Connecté ?
	if (!locals.user) return { success: false, error: 'Non autorisé' };

	const formData = await request.formData();

	// 2. Validation des champs simples
	//    (Object.fromEntries ne garde qu'une valeur par nom : parfait ici, pas pour les fichiers)
	const parsed = createCareSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		return {
			success: false,
			error: 'Erreur de validation',
			errors: zodFieldErrors(parsed.error)
		};
	}

	const { catId, type, date, reason, veterinary, description, sicknessId } = parsed.data;

	// 3. Droits : admin, ou bénévole associée au chat
	if (!(await canManageCat(locals.user, catId))) {
		return { success: false, error: "Vous n'avez pas le droit d'ajouter un soin à ce chat" };
	}

	// 4. Le chat (son état de vaccination sert à healthUpdateFor)
	const cat = await prisma.cat.findUnique({
		where: { id: catId },
		select: { vaccinate: true }
	});
	if (!cat) return { success: false, error: 'Chat introuvable' };

	// 5. La maladie, si elle est indiquée, doit concerner CE chat
	if (sicknessId) {
		const belongsToCat = await prisma.sickness.count({ where: { id: sicknessId, catId } });
		if (!belongsToCat) {
			return {
				success: false,
				error: 'Maladie invalide pour ce chat',
				errors: { sicknessId: ['Maladie invalide'] }
			};
		}
	}

	// 6. Les documents : plusieurs valeurs pour le même nom de champ → getAll
	const keys = formData.getAll('mediaStorageKey').map(String);
	const names = formData.getAll('mediaOriginalName').map(String);

	if (keys.length > MAX_DOCUMENTS) {
		await discardUploads('careDocument', keys, catId);
		return { success: false, error: `${MAX_DOCUMENTS} documents maximum par soin` };
	}

	// Toutes les vérifications S3 en parallèle
	const prepared = await Promise.all(
		keys.map((storageKey, i) =>
			prepareMedia('careDocument', { storageKey, originalName: names[i] }, catId)
		)
	);

	const failed = prepared.find((p) => !p.ok);
	if (failed && !failed.ok) {
		// Un fichier refusé : on supprime aussi les autres, sinon ils resteraient orphelins
		await discardUploads('careDocument', keys, catId);
		return { success: false, error: failed.error, errors: { media: [failed.error] } };
	}

	const medias = prepared.flatMap((p) => (p.ok ? [p.data] : []));

	// 7. Le soin, ses documents ET la mise à jour de la fiche : tout ou rien
	try {
		await prisma.$transaction(async (tx) => {
			await tx.care.create({
				data: {
					cat: { connect: { id: catId } },
					type,
					// "2026-11-06" est lu comme minuit UTC : la bonne date en base
					date: new Date(date),
					reason,
					veterinary: veterinary ?? null,
					description: description ?? null,
					...(sicknessId && { sickness: { connect: { id: sicknessId } } }),
					documents: {
						create: medias.map((media) => ({ media: { create: media } }))
					}
				}
			});

			const healthUpdate = healthUpdateFor(type, cat.vaccinate);
			if (Object.keys(healthUpdate).length > 0) {
				await tx.cat.update({ where: { id: catId }, data: healthUpdate });
			}
		});
	} catch (error) {
		console.error('Erreur création soin:', error);
		await discardUploads('careDocument', keys, catId);
		return { success: false, error: "Erreur lors de l'enregistrement du soin" };
	}

	return { success: true, message: 'Soin ajouté' };
}

// ==========================================
// DELETE - Supprimer un soin (et ses documents)
// Ne modifie PAS la fiche du chat : à corriger à la main si besoin
// ==========================================
export async function deleteCare({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}): Promise<Result> {
	// 1. Connecté ?
	if (!locals.user) return { success: false, error: 'Non autorisé' };

	// 2. L'id du soin
	const formData = await request.formData();
	const careId = z.string().uuid().safeParse(formData.get('careId'));
	if (!careId.success) return { success: false, error: 'Soin invalide' };

	// 3. Le soin, avec les media de ses documents (pour nettoyer S3 ensuite)
	const care = await prisma.care.findUnique({
		where: { id: careId.data },
		include: { documents: { include: { media: true } } }
	});
	if (!care) return { success: false, error: 'Soin introuvable' };

	// 4. Droits sur le chat du soin, lu EN BASE
	if (!(await canManageCat(locals.user, care.catId))) {
		return { success: false, error: "Vous n'avez pas le droit de supprimer ce soin" };
	}

	// 5. Le soin (ses CareDocument suivent en cascade)
	await prisma.care.delete({ where: { id: care.id } });

	// 6. Les lignes Media et leurs fichiers
	await deleteMedia(care.documents.map((document) => document.media));

	return { success: true, message: 'Soin supprimé' };
}
