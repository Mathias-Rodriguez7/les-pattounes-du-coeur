import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { allVeterinarians } from '#lib/server/veterinarians/queries.ts';
import {
	createVeterinarianAction,
	setVeterinarianActiveAction,
	updateVeterinarianAction
} from '#lib/server/veterinarians/actions.ts';

// Tout le monde consulte la liste (coordonnées, horaires) ; seule l'admin la modifie
export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	const isAdmin = hasAdminRole(locals.user);
	const veterinarians = await allVeterinarians();

	return {
		// Les vétérinaires retirés ne sont montrés qu'à l'admin (pour les remettre)
		veterinarians: isAdmin ? veterinarians : veterinarians.filter((vet) => vet.isActive),
		isAdmin
	};
};

export const actions: Actions = {
	createVeterinarian: createVeterinarianAction,
	updateVeterinarian: updateVeterinarianAction,
	setVeterinarianActive: setVeterinarianActiveAction
};
