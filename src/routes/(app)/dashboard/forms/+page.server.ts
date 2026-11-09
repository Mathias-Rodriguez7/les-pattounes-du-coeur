import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { FormType, FormStatus, type Prisma } from '@prisma/client';
import { updateForm, assignVolunteer, setFlexibleDispatcher } from '$lib/server/forms/mutations';
import { createVolunteer } from '$lib/server/volunteers/mutations';
import { createHost } from '$lib/server/hosts/mutations';
import { createAdoptionSchema } from '$lib/schemas/adoption';
import { createAdoption } from '$lib/server/adoptions/mutations';
import { canManageForm, managedFormsWhere } from '$lib/server/permissions/form';

/** 🆕 Une demande, avec juste ce que les panneaux affichent */
const formInclude = {
	assignedTo: {
		select: { id: true, profil: { select: { firstName: true, lastName: true } } }
	},
	cat: {
		select: {
			id: true,
			name: true,
			catNumber: true,
			sex: true,
			birthDate: true,
			status: true,
			// La référente en premier (la plus ancienne bénévole associée)
			volunteers: {
				orderBy: { createdAt: 'asc' },
				select: {
					volunteer: {
						select: { id: true, profil: { select: { firstName: true, lastName: true } } }
					}
				}
			}
		}
	}
} satisfies Prisma.FormInclude;

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

	const isAdmin = volunteer.role === 'ADMIN';
	const isFlexibleDispatcher = volunteer.isFlexibleDispatcher;
	const canSeeAllFlexible = isAdmin || isFlexibleDispatcher;

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

	// 🔀 Mode d'affichage : 'mine' par défaut, 'flexible' seulement si autorisé
	const requestedScope = scopeParam === 'flexible' ? 'flexible' : 'mine';
	const scope = requestedScope === 'flexible' && canSeeAllFlexible ? 'flexible' : 'mine';

	const baseFilters: Prisma.FormWhereInput = {
		...(typeFilter && { type: typeFilter }),
		...(statusFilter && { status: statusFilter })
	};

	// 🏗️ Condition WHERE selon le mode
	// 🆕 Typée : TypeScript vérifie les noms de champs (avant : Record<string, unknown>)
	const whereCondition: Prisma.FormWhereInput =
		scope === 'flexible'
			? // Tous les ADOPTION_FLEXIBLE, sans restriction d'assignation
				{ ...baseFilters, type: FormType.ADOPTION_FLEXIBLE }
			: // 🆕 Les demandes assignées OU celles de mes chats (admin : toutes)
				{ AND: [baseFilters, managedFormsWhere(locals.user)] };

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
	const forms = await prisma.form.findMany({
		where: whereCondition,
		include: formInclude,
		orderBy: { createdAt: 'desc' }
	});

	// 📋 Volunteers pour l'assignation (admin uniquement)
	const volunteers = isAdmin
		? await prisma.volunteer.findMany({
				include: {
					profil: { select: { firstName: true, lastName: true } }
				},
				orderBy: { profil: { firstName: 'asc' } }
			})
		: [];

	// 🐱 Chats disponibles pour l'adoption flexible
	const cats = await prisma.cat.findMany({
		where: {
			status: 'AVAILABLE',
			isVisible: true
		},
		orderBy: { name: 'asc' }
	});

	return {
		forms,
		volunteers,
		cats,
		stats: { totalForms, pendingForms, approvedForms, rejectedForms },
		isAdmin,
		canSeeAllFlexible,
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

	createAdoption: async ({ request, locals }) => {
		// Le load protège l'affichage, pas les actions : on vérifie ici
		if (!locals.user) {
			return fail(401, { error: 'Vous devez être connecté' });
		}

		const formData = await request.formData();
		const parsed = createAdoptionSchema.safeParse(Object.fromEntries(formData));
		if (!parsed.success) {
			return fail(400, {
				error: 'Erreur de validation',
				errors: parsed.error.flatten().fieldErrors
			});
		}

		// 🆕 La demande existe, c'est une demande d'adoption, et la bénévole peut la traiter
		const adoptionRequest = await prisma.form.findUnique({
			where: { id: parsed.data.formId },
			select: { type: true, catId: true, assignedToId: true }
		});
		if (!adoptionRequest || !adoptionRequest.type.startsWith('ADOPTION')) {
			return fail(404, { error: 'Demande introuvable' });
		}
		if (!(await canManageForm(locals.user, adoptionRequest))) {
			return fail(403, { error: "Vous n'êtes pas autorisée à traiter cette demande" });
		}

		// 🆕 Une demande précise ne peut aboutir qu'à l'adoption de SON chat
		if (
			adoptionRequest.type === 'ADOPTION_SPECIFIC' &&
			adoptionRequest.catId !== parsed.data.catId
		) {
			return fail(400, { error: 'Cette demande concerne un autre chat' });
		}

		try {
			const adoption = await createAdoption(parsed.data);
			return { success: true, adoptionId: adoption.id };
		} catch (err) {
			// Les messages de createAdoption sont écrits pour l'utilisatrice (« Le chat … n'est plus disponible »)
			const message = err instanceof Error ? err.message : 'Erreur inconnue';
			return fail(400, { error: message });
		}
	}
};
