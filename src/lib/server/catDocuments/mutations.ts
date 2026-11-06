import { z } from 'zod';
import prisma from '$lib/server/prisma';
import { createCatDocumentSchema } from '$lib/schemas/catDocument';
import { canManageCat } from '$lib/server/permissions/cat';
import { prepareMedia, deleteMedia } from '$lib/server/media/mutations';
import { deleteFiles } from '$lib/server/storage';

type Result = {
	success: boolean;
	message?: string;
	error?: string;
	errors?: Record<string, string[] | undefined>;
};

export async function createCatDocument({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}): Promise<Result> {
	if (!locals.user) return { success: false, error: 'Non autorisé' };

	const formData = await request.formData();
	const parsed = createCatDocumentSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		return {
			success: false,
			error: 'Erreur de validation',
			errors: parsed.error.flatten().fieldErrors
		};
	}

	const { catId, kind, date, note, adoptionId, mediaStorageKey, mediaOriginalName } = parsed.data;

	// 1. Droits : admin, ou bénévole associée au chat
	if (!(await canManageCat(locals.user, catId))) {
		return { success: false, error: "Vous n'avez pas le droit d'ajouter un document à ce chat" };
	}

	// 2. L'adoption, si elle est indiquée, doit concerner CE chat
	if (adoptionId) {
		const belongsToCat = await prisma.adoption.count({ where: { id: adoptionId, catId } });
		if (!belongsToCat) {
			return {
				success: false,
				error: 'Adoption invalide pour ce chat',
				errors: { adoptionId: ['Adoption invalide'] }
			};
		}
	}

	// 3. Le fichier : vérifié sur S3, dans le dossier de CE chat, bucket privé
	const prepared = await prepareMedia(
		'catDocument',
		{ storageKey: mediaStorageKey, originalName: mediaOriginalName },
		catId
	);
	if (!prepared.ok) {
		return { success: false, error: prepared.error, errors: { media: [prepared.error] } };
	}

	// 4. Le document et sa ligne Media, en une seule requête
	try {
		await prisma.catDocument.create({
			data: {
				cat: { connect: { id: catId } },
				kind,
				// "2026-11-06" est lu comme minuit UTC : la bonne date dans une colonne @db.Date
				date: new Date(date),
				note: note ?? null,
				...(adoptionId && { adoption: { connect: { id: adoptionId } } }),
				media: { create: prepared.data }
			}
		});
	} catch (error) {
		console.error('Erreur création document:', error);
		await deleteFiles([{ storageKey: mediaStorageKey, isPrivate: true }]);
		return { success: false, error: "Erreur lors de l'enregistrement du document" };
	}

	return { success: true, message: 'Document ajouté' };
}

export async function deleteCatDocument({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}): Promise<Result> {
	if (!locals.user) return { success: false, error: 'Non autorisé' };

	const formData = await request.formData();
	const documentId = z.string().uuid().safeParse(formData.get('documentId'));
	if (!documentId.success) return { success: false, error: 'Document invalide' };

	const document = await prisma.catDocument.findUnique({
		where: { id: documentId.data },
		include: { media: true }
	});
	if (!document) return { success: false, error: 'Document introuvable' };

	// Les droits se vérifient sur le chat du document, PAS sur un catId envoyé par le navigateur
	if (!(await canManageCat(locals.user, document.catId))) {
		return { success: false, error: "Vous n'avez pas le droit de supprimer ce document" };
	}

	await prisma.catDocument.delete({ where: { id: document.id } });
	await deleteMedia([document.media]);

	return { success: true, message: 'Document supprimé' };
}
