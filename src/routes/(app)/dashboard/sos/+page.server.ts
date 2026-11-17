import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '#lib/server/prisma.ts';
import { hasAdminRole, requireUser } from '#lib/server/permissions/roles.ts';
import { listSos } from '#lib/server/sos/queries.ts';
import {
	assignSosAction,
	createSosAction,
	dismissSosAction,
	reopenSosAction,
	takeSosAction,
	updateSosAction
} from '#lib/server/sos/actions.ts';
import { createCat } from '#lib/server/cats/mutations.ts';

// La page SOS : toutes les bénévoles voient les SOS et peuvent en prendre un en charge.
// Le contact de la personne qui signale est retiré par listSos quand on n'a pas le droit de le voir
export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const isAdmin = hasAdminRole(user);

	const [sosList, volunteers] = await Promise.all([
		listSos(user),
		// « Confier à » (admin) : les bénévoles actives
		isAdmin
			? prisma.volunteer.findMany({
					where: { actif: 'ACTIVE' },
					select: { id: true, profil: { select: { firstName: true, lastName: true } } },
					orderBy: { profil: { firstName: 'asc' } }
				})
			: []
	]);

	return {
		sosList,
		isAdmin,
		// Le filtre « Pris en charge : par moi »
		userId: user.id,
		volunteers: volunteers.map((v) => ({
			id: v.id,
			name: `${v.profil.firstName} ${v.profil.lastName}`
		}))
	};
};

export const actions: Actions = {
	createSos: createSosAction,
	takeSos: takeSosAction,
	updateSos: updateSosAction,
	assignSos: assignSosAction,
	dismissSos: dismissSosAction,
	reopenSos: reopenSosAction,

	// « Créer un chat » depuis un SOS : le même code que la page Chats (+ le lien au SOS)
	createCat: async ({ request, locals }) => {
		const result = await createCat({ request, locals });
		if (!result.success) return fail(400, result);
		return result;
	}
};
