import type { LayoutServerLoad } from './$types';
import { countMyDueAdoptions } from '#lib/server/adoptions/queries.ts';
import { countNewSos } from '#lib/server/sos/queries.ts';
import { canPublishCats } from '#lib/permissions/publication.ts';
import prisma from '#lib/server/prisma.ts';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Les rappels de la sidebar : uniquement pour une bénévole connectée.
	// Recalculés après chaque action (enhance → update() relance les load) : le badge suit.
	const [dueAdoptionsCount, newSosCount, catsToPublishCount] = locals.user
		? await Promise.all([
				countMyDueAdoptions(locals.user.id),
				countNewSos(),
				// Les chats proposés à l'adoption : pour celles qui les publient (admin, communication)
				canPublishCats(locals.user.role)
					? prisma.cat.count({ where: { publicationRequestedAt: { not: null } } })
					: 0
			])
		: [0, 0, 0];

	return {
		user: locals.user,
		dueAdoptionsCount,
		// Les SOS que personne n'a encore pris : la pastille du lien « SOS »
		newSosCount,
		catsToPublishCount
	};
};
