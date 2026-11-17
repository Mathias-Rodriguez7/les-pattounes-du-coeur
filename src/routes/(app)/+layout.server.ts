import type { LayoutServerLoad } from './$types';
import { countMyDueAdoptions } from '#lib/server/adoptions/queries.ts';
import { countNewSos } from '#lib/server/sos/queries.ts';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Les rappels de la sidebar : uniquement pour une bénévole connectée.
	// Recalculés après chaque action (enhance → update() relance les load) : le badge suit.
	const [dueAdoptionsCount, newSosCount] = locals.user
		? await Promise.all([countMyDueAdoptions(locals.user.id), countNewSos()])
		: [0, 0];

	return {
		user: locals.user,
		dueAdoptionsCount,
		// Les SOS que personne n'a encore pris : la pastille du lien « SOS »
		newSosCount
	};
};
