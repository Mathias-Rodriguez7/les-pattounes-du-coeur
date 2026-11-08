import { z } from 'zod';
import prisma from '$lib/server/prisma';
import { createInfoDocumentSchema, updateInfoDocumentSchema } from '$lib/schemas/infoDocument';
import { prepareMedia, deleteMedia, type MediaData } from '$lib/server/media/mutations';
import { deleteFiles } from '$lib/server/storage';

type Result = {
	success: boolean;
	message?: string;
	error?: string;
	errors?: Record<string, string[] | undefined>;
};

type Args = { request: Request; locals: App.Locals };

const isAdmin = (locals: App.Locals) => locals.user?.role === 'ADMIN';

// ==========================================
// CREATE
// ==========================================
export async function createInfoDocument({ request, locals }: Args): Promise<Result> {
	if (!isAdmin(locals)) return { success: false, error: 'Non autorisé' };

	const parsed = createInfoDocumentSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) {
		return {
			success: false,
			error: 'Erreur de validation',
			errors: parsed.error.flatten().fieldErrors
		};
	}
	const { title, description, category, mediaStorageKey, mediaOriginalName } = parsed.data;

	const prepared = await prepareMedia('infoDocument', {
		storageKey: mediaStorageKey,
		originalName: mediaOriginalName
	});
	if (!prepared.ok) {
		return { success: false, error: prepared.error, errors: { media: [prepared.error] } };
	}

	try {
		await prisma.infoDocument.create({
			data: {
				title,
				description: description ?? null,
				category,
				file: { create: prepared.data }
			}
		});
	} catch (error) {
		console.error('Erreur création document info:', error);
		await deleteFiles([{ storageKey: mediaStorageKey, isPrivate: true }]);
		return { success: false, error: "Erreur lors de l'enregistrement du document" };
	}

	return { success: true, message: 'Document ajouté' };
}

// ==========================================
// UPDATE (le fichier peut être remplacé)
// ==========================================
export async function updateInfoDocument({ request, locals }: Args): Promise<Result> {
	if (!isAdmin(locals)) return { success: false, error: 'Non autorisé' };

	const parsed = updateInfoDocumentSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) {
		return {
			success: false,
			error: 'Erreur de validation',
			errors: parsed.error.flatten().fieldErrors
		};
	}
	const { id, title, description, category, mediaStorageKey, mediaOriginalName } = parsed.data;

	const existing = await prisma.infoDocument.findUnique({ where: { id }, include: { file: true } });
	if (!existing) return { success: false, error: 'Document introuvable' };

	// Nouveau fichier ? On le vérifie avant de toucher à la base
	let newFile: MediaData | null = null;
	if (mediaStorageKey) {
		const prepared = await prepareMedia('infoDocument', {
			storageKey: mediaStorageKey,
			originalName: mediaOriginalName
		});
		if (!prepared.ok) {
			return { success: false, error: prepared.error, errors: { media: [prepared.error] } };
		}
		newFile = prepared.data;
	}

	try {
		await prisma.infoDocument.update({
			where: { id },
			data: {
				title,
				description: description ?? null,
				category,
				// Le document pointe vers le NOUVEAU fichier ; l'ancien n'est plus relié à rien
				...(newFile && { file: { create: newFile } })
			}
		});
	} catch (error) {
		console.error('Erreur modification document info:', error);
		if (newFile) await deleteFiles([{ storageKey: newFile.storageKey, isPrivate: true }]);
		return { success: false, error: 'Erreur lors de la modification du document' };
	}

	// L'ancien fichier ne sert plus : sa ligne Media et le fichier sur S3
	if (newFile) await deleteMedia([existing.file]);

	return { success: true, message: 'Document modifié' };
}

// ==========================================
// DELETE
// ==========================================
export async function deleteInfoDocument({ request, locals }: Args): Promise<Result> {
	if (!isAdmin(locals)) return { success: false, error: 'Non autorisé' };

	const id = z
		.string()
		.uuid()
		.safeParse((await request.formData()).get('documentId'));
	if (!id.success) return { success: false, error: 'Document invalide' };

	const document = await prisma.infoDocument.findUnique({
		where: { id: id.data },
		include: { file: true }
	});
	if (!document) return { success: false, error: 'Document introuvable' };

	// Le document d'abord (il pointe vers le fichier), puis le fichier
	await prisma.infoDocument.delete({ where: { id: document.id } });
	await deleteMedia([document.file]);

	return { success: true, message: 'Document supprimé' };
}
