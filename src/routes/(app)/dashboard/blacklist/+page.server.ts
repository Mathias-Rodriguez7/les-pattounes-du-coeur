import type { Actions, PageServerLoad } from './$types';
import { getBlacklistOverview } from '#lib/server/blacklist/queries.ts';
import { addToBlacklistAction, liftBlacklistAction } from '#lib/server/blacklist/actions.ts';
import { requireAdmin } from '#lib/server/permissions/roles.ts';

export const load: PageServerLoad = async ({ locals }) => {
	// Page réservée à l'admin (la Sidebar cache le lien, mais c'est ICI que ça se décide)
	requireAdmin(locals, '/dashboard');

	return await getBlacklistOverview();
};

export const actions: Actions = {
	addToBlacklist: addToBlacklistAction,
	liftBlacklist: liftBlacklistAction
};
