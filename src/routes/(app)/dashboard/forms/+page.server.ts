import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '#lib/server/prisma.ts';
import { FormType, FormStatus, type Prisma } from '@prisma/client';
import {
	updateForm,
	rejectForm,
	assignVolunteer,
	setFlexibleDispatcher
} from '#lib/server/forms/mutations.ts';
import { createVolunteer } from '#lib/server/volunteers/mutations.ts';
import { createHost } from '#lib/server/hosts/mutations.ts';
import { catPickerSelect } from '#lib/types/cat.ts';
import { myFormsWhere } from '#lib/server/permissions/form.ts';
import { createAdoptionAction } from '#lib/server/adoptions/actions.ts';
import { formInclude } from '#lib/types/form.ts';
import { withBlacklist } from '#lib/server/accountStatus.ts';
import { addToBlacklistAction } from '#lib/server/blacklist/actions.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const volunteerId = locals.user.id;
	const volunteer = await prisma.volunteer.findUnique({
		where: { id: volunteerId },
		select: { role: true, isFlexibleDispatcher: true }
	});

	if (!volunteer) {
		redirect(302, '/');
	}

	const isAdmin = hasAdminRole(volunteer);
	const isFlexibleDispatcher = volunteer.isFlexibleDispatcher;
	// Vue « Tous » : l'admin voit toutes les demandes, la répartitrice toutes les demandes libres
	const canSeeAll = isAdmin || isFlexibleDispatcher;

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

	// 🔀 Mode d'affichage : 'mine' par défaut, 'all' seulement si autorisé
	const scope: 'mine' | 'all' = scopeParam === 'all' && canSeeAll ? 'all' : 'mine';

	const baseFilters: Prisma.FormWhereInput = {
		...(typeFilter && { type: typeFilter }),
		...(statusFilter && { status: statusFilter })
	};

	// 🏗️ Condition WHERE selon le mode
	// - mine : mes demandes (assignées OU de mes chats), pour tout le monde, admin compris
	// - all + admin : toutes les demandes
	// - all + répartitrice : toutes les demandes libres
	let whereCondition: Prisma.FormWhereInput;
	if (scope === 'mine') {
		whereCondition = { AND: [baseFilters, myFormsWhere(volunteerId)] };
	} else if (isAdmin) {
		whereCondition = baseFilters;
	} else {
		whereCondition = { ...baseFilters, type: FormType.ADOPTION_FLEXIBLE };
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
	const forms = await withBlacklist(
		await prisma.form.findMany({
			where: whereCondition,
			include: formInclude,
			orderBy: { createdAt: 'desc' }
		})
	);

	// 📋 Volunteers pour l'assignation : admin, et répartitrice des demandes libres
	const canAssign = isAdmin || isFlexibleDispatcher;
	const volunteers = canAssign
		? await prisma.volunteer.findMany({
				select: {
					id: true,
					isFlexibleDispatcher: true,
					profil: { select: { firstName: true, lastName: true } }
				},
				orderBy: { profil: { firstName: 'asc' } }
			})
		: [];

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
		canAssign,
		canSeeAll,
		scope,
		filters: {
			type: typeFilter || null,
			status: statusFilter || null
		}
	};
};

export const actions: Actions = {
	createVolunteer: async ({ request, locals }) => {
		try {
			const formData = await request.clone().formData();
			const formId = formData.get('formId')?.toString();

			const result = await createVolunteer({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}

			if (formId) {
				await prisma.form.update({
					where: { id: formId },
					data: { status: 'APPROVED' }
				});
			}

			return result;
		} catch (error) {
			console.error('Erreur création bénévole:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	createHost: async ({ request, locals }) => {
		try {
			const formData = await request.clone().formData();
			const formId = formData.get('formId')?.toString();

			const result = await createHost({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			if (formId) {
				await prisma.form.update({
					where: { id: formId },
					data: { status: 'APPROVED' }
				});
			}
			return result;
		} catch (error) {
			console.error("Erreur création famille d'accueil:", error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updateForm: async ({ request, locals }) => {
		try {
			const result = await updateForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur mise à jour form:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	rejectForm: async ({ request, locals }) => {
		try {
			const result = await rejectForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur refus demande:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	assignVolunteer: async ({ request, locals }) => {
		try {
			const result = await assignVolunteer({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur assignation bénévole:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	setFlexibleDispatcher: async ({ request, locals }) => {
		try {
			const result = await setFlexibleDispatcher({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur mise à jour dispatcher flexible:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// Le code est partagé avec la page Chats (adopter depuis la fiche du chat)
	createAdoption: createAdoptionAction,
	// Bouton « Blacklister » des panneaux d'édition (admin uniquement)
	addToBlacklist: addToBlacklistAction
};
