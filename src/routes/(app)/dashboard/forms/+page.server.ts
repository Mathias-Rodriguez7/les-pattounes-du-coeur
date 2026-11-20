import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '#lib/server/prisma.ts';
import { FormType, FormStatus, type Prisma } from '@prisma/client';
import {
	updateForm,
	rejectForm,
	assignVolunteer,
	markFormInProgress,
	addFormAssignee,
	removeFormAssignee
} from '#lib/server/forms/mutations.ts';
import { createVolunteer } from '#lib/server/volunteers/mutations.ts';
import { createHost } from '#lib/server/hosts/mutations.ts';
import { catPickerSelect } from '#lib/types/cat.ts';
import { assignRights, myFormsWhere } from '#lib/server/permissions/form.ts';
import { createAdoptionAction } from '#lib/server/adoptions/actions.ts';
import { formInclude } from '#lib/types/form.ts';
import { withBlacklist } from '#lib/server/accountStatus.ts';
import { addToBlacklistAction } from '#lib/server/blacklist/actions.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const user = locals.user;
	const volunteerId = user.id;
	// locals.user est rechargé à chaque requête : inutile de relire le rôle en base
	const isAdmin = hasAdminRole(user);

	// 🔍 Filtres
	const typeParam = url.searchParams.get('type');
	const statusParam = url.searchParams.get('status');
	const scopeParam = url.searchParams.get('scope');

	const typeFilter =
		typeParam && Object.values(FormType).includes(typeParam as FormType)
			? (typeParam as FormType)
			: undefined;

	const statusFilter =
		statusParam && Object.values(FormStatus).includes(statusParam as FormStatus)
			? (statusParam as FormStatus)
			: undefined;

	// 🔀 Mode d'affichage : 'mine' par défaut, 'all' sur demande.
	// « Tous » = toutes les demandes pour l'admin ; pour les autres, les demandes LIBRES
	// que personne n'a encore prises (elles se les attribuent)
	const scope: 'mine' | 'all' = scopeParam === 'all' ? 'all' : 'mine';

	const baseFilters: Prisma.FormWhereInput = {
		...(typeFilter && { type: typeFilter }),
		...(statusFilter && { status: statusFilter })
	};

	// 🏗️ Condition WHERE selon le mode
	// - mine : mes demandes (assignées OU de mes chats), pour tout le monde, admin compris
	// - all + admin : toutes les demandes
	// - all + bénévole : les demandes libres à personne
	let whereCondition: Prisma.FormWhereInput;
	if (scope === 'mine') {
		whereCondition = { AND: [baseFilters, myFormsWhere(volunteerId)] };
	} else if (isAdmin) {
		whereCondition = baseFilters;
	} else {
		whereCondition = { ...baseFilters, type: FormType.ADOPTION_FLEXIBLE, assignedToId: null };
	}

	// 📊 Stats
	const [totalForms, pendingForms, approvedForms, rejectedForms] = await Promise.all([
		prisma.form.count({ where: whereCondition }),
		prisma.form.count({ where: { ...whereCondition, status: 'PENDING' } }),
		prisma.form.count({ where: { ...whereCondition, status: 'APPROVED' } }),
		prisma.form.count({ where: { ...whereCondition, status: 'REJECTED' } })
	]);

	// 📋 Forms
	// 🆕 Le chat et la bénévole assignée arrivent avec la demande, en une seule requête
	// (avant : une requête de plus par demande pour retrouver son chat)
	// Chaque demande arrive avec `blacklist` : la raison, si son email est blacklisté
	const [rawForms, myCats] = await Promise.all([
		prisma.form.findMany({
			where: whereCondition,
			include: formInclude,
			orderBy: { createdAt: 'desc' }
		}),
		prisma.catVolunteer.findMany({ where: { volunteerId }, select: { catId: true } })
	]);

	// canManage : peut-elle TRAITER la demande (modifier, refuser, adopter) ? Même règle que
	// canManageForm côté serveur. Dans « Tous », une demande libre d'une autre bénévole se
	// consulte… et s'attribue d'abord (bouton « Me l'attribuer »)
	const myCatIds = new Set(myCats.map((c) => c.catId));
	// canReassign / canTake : quels boutons d'attribution afficher (même règle que le serveur)
	const forms = (await withBlacklist(rawForms)).map((form) => ({
		...form,
		canManage:
			isAdmin ||
			form.assignedToId === volunteerId ||
			(form.catId !== null && myCatIds.has(form.catId)),
		...assignRights(user, form)
	}));

	// 📋 Les bénévoles à qui attribuer une demande : seulement celles en activité
	// (toute bénévole peut attribuer une demande libre : voir canAssignForm)
	const volunteers = await prisma.volunteer.findMany({
		where: { OR: [{ actif: 'ACTIVE' }, { actif: null }] },
		// Le rôle : seules les admins suivent les candidatures bénévole / colab
		select: { id: true, role: true, profil: { select: { firstName: true, lastName: true } } },
		orderBy: { profil: { firstName: 'asc' } }
	});

	// 🐱 Les chats qu'on peut proposer pour une demande libre :
	// adoptables, et seulement ceux dont la personne connectée est en charge (admin compris)
	const cats = await prisma.cat.findMany({
		where: {
			status: 'AVAILABLE',
			isVisible: true,
			volunteers: { some: { volunteerId } }
		},
		select: catPickerSelect,
		orderBy: { name: 'asc' }
	});

	return {
		forms,
		volunteers,
		cats,
		stats: { totalForms, pendingForms, approvedForms, rejectedForms },
		isAdmin,
		userId: volunteerId,
		scope,
		filters: {
			type: typeFilter || null,
			status: statusFilter || null
		}
	};
};

export const actions: Actions = {
	// La demande sera acceptée quand la personne aura accepté le document (acceptInvitation) :
	// en attendant, elle reste « en attente »
	createVolunteer: async ({ request, locals }) => {
		try {
			const result = await createVolunteer({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur création bénévole:', error);
			return fail(500, { success: false, error: 'Une erreur est survenue. Réessayez.' });
		}
	},

	createHost: async ({ request, locals }) => {
		try {
			const result = await createHost({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error("Erreur création famille d'accueil:", error);
			return fail(500, { success: false, error: 'Une erreur est survenue. Réessayez.' });
		}
	},

	updateForm: async ({ request, locals }) => {
		try {
			const result = await updateForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur mise à jour form:', error);
			return fail(500, { success: false, error: 'Une erreur est survenue. Réessayez.' });
		}
	},

	// Candidatures bénévole / colab : les admins qui les suivent
	addFormAssignee: async ({ request, locals }) => {
		const result = await addFormAssignee({ request, locals });
		if (!result.success) return fail(400, result);
		return result;
	},
	removeFormAssignee: async ({ request, locals }) => {
		const result = await removeFormAssignee({ request, locals });
		if (!result.success) return fail(400, result);
		return result;
	},

	// « Je commence » : la demande passe « en cours de traitement »
	markFormInProgress: async ({ request, locals }) => {
		const result = await markFormInProgress({ request, locals });
		if (!result.success) return fail(400, result);
		return result;
	},

	rejectForm: async ({ request, locals }) => {
		try {
			const result = await rejectForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur refus demande:', error);
			return fail(500, { success: false, error: 'Une erreur est survenue. Réessayez.' });
		}
	},

	assignVolunteer: async ({ request, locals }) => {
		try {
			const result = await assignVolunteer({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur assignation bénévole:', error);
			return fail(500, { success: false, error: 'Une erreur est survenue. Réessayez.' });
		}
	},

	// Le code est partagé avec la page Chats (adopter depuis la fiche du chat)
	createAdoption: createAdoptionAction,
	// Bouton « Blacklister » des panneaux d'édition (admin uniquement)
	addToBlacklist: addToBlacklistAction
};
