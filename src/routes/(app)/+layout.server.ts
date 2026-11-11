import type { LayoutServerLoad } from './$types';
import { countMyDueAdoptions } from '#lib/server/adoptions/queries.ts';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Les rappels de la sidebar : uniquement pour une bénévole connectée.
	// Recalculés après chaque action (enhance → update() relance les load) : le badge suit.
	const dueAdoptionsCount = locals.user ? await countMyDueAdoptions(locals.user.id) : 0;

	return {
		user: locals.user,
		dueAdoptionsCount
	};
};
