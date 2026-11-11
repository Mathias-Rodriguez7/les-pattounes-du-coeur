import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getBlacklistOverview } from '#lib/server/blacklist/queries.ts';
import { addToBlacklistAction, liftBlacklistAction } from '#lib/server/blacklist/actions.ts';

export const load: PageServerLoad = async ({ locals }) => {
	// Page réservée à l'admin (la Sidebar cache le lien, mais c'est ICI que ça se décide)
	if (!locals.user) redirect(302, '/');
	if (locals.user.role !== 'ADMIN') redirect(302, '/dashboard');

	return await getBlacklistOverview();
};

export const actions: Actions = {
	addToBlacklist: addToBlacklistAction,
	liftBlacklist: liftBlacklistAction
};
