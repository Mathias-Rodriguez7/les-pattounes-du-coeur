import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '#lib/server/prisma.ts';
import {
	createInfoDocument,
	updateInfoDocument,
	deleteInfoDocument
} from '#lib/server/infoDocuments/mutations.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	const documents = await prisma.infoDocument.findMany({
		orderBy: { title: 'asc' },
		include: {
			// Jamais la storageKey : l'ouverture passe par /api/media/<id>
			file: { select: { id: true, mimeType: true, sizeBytes: true, originalName: true } }
		}
	});

	return {
		documents: documents.map((doc) => ({
			...doc,
			url: `/api/media/${doc.file.id}`,
			downloadUrl: `/api/media/${doc.file.id}?download=1`
		})),
		isAdmin: hasAdminRole(locals.user)
	};
};

export const actions: Actions = {
	createInfoDocument: async ({ request, locals }) => {
		try {
			const result = await createInfoDocument({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur création document info:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updateInfoDocument: async ({ request, locals }) => {
		try {
			const result = await updateInfoDocument({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur modification document info:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteInfoDocument: async ({ request, locals }) => {
		try {
			const result = await deleteInfoDocument({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur suppression document info:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	}
};
