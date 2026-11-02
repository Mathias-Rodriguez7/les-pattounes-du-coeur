// src/routes/benevole/info/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { infoDocuments } from '$lib/server/infoDocuments';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	return {
		documents: infoDocuments.map((doc) => ({
			...doc,
			url: `/pdf/help/${doc.file}`
		}))
	};
};
