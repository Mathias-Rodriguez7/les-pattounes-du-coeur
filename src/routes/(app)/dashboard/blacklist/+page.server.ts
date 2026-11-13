import type { Actions, PageServerLoad } from './$types';
import { getBlacklistOverview } from '#lib/server/blacklist/queries.ts';
import { addToBlacklistAction, liftBlacklistAction } from '#lib/server/blacklist/actions.ts';
import { hasAdminRole, requireUser } from '#lib/server/permissions/roles.ts';

export const load: PageServerLoad = async ({ locals }) => {
	// Toute l'équipe consulte la blacklist ; seule l'admin agit (les actions le vérifient)
	const user = requireUser(locals);

	return { ...(await getBlacklistOverview()), isAdmin: hasAdminRole(user) };
};

export const actions: Actions = {
	addToBlacklist: addToBlacklistAction,
	liftBlacklist: liftBlacklistAction
};
