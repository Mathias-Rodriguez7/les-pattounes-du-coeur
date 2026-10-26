import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { FormType, FormStatus } from '@prisma/client';
import { updateForm, assignVolunteer, setFlexibleDispatcher } from '$lib/server/forms/mutations';
import { createVolunteer } from '$lib/server/volunteers/mutations';
import { createHost } from '$lib/server/hosts/mutations';
import { createAdoptionSchema } from '$lib/schemas/adoption';
import { createAdoption } from '$lib/server/adoptions/mutations';

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

	const baseFilters = {
		...(typeFilter && { type: typeFilter }),
		...(statusFilter && { status: statusFilter })
	};

	// 🏗️ Condition WHERE selon le mode
	let whereCondition: Record<string, unknown>;

	if (scope === 'flexible') {
		// Tous les ADOPTION_FLEXIBLE, sans restriction d'assignation
		whereCondition = {
			...baseFilters,
			type: FormType.ADOPTION_FLEXIBLE
		};
	} else {
		// Uniquement les forms assignés à ce volunteer
		// Admin : pas de restriction, comme avant
		whereCondition = isAdmin
			? baseFilters
			: {
					...baseFilters,
					assignedToId: volunteerId
				};
	}

	// 📊 Stats
	const [totalForms, pendingForms, approvedForms, rejectedForms] = await Promise.all([
		prisma.form.count({ where: whereCondition }),
		prisma.form.count({ where: { ...whereCondition, status: 'PENDING' } }),
		prisma.form.count({ where: { ...whereCondition, status: 'APPROVED' } }),
		prisma.form.count({ where: { ...whereCondition, status: 'REJECTED' } })
	]);

	// 📋 Forms
	const forms = await prisma.form.findMany({
		where: whereCondition,
		include: {
			assignedTo: {
				include: {
					profil: { select: { firstName: true, lastName: true } }
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	// ✅ Enrichissement ADOPTION_SPECIFIC (inchangé)
	const enrichedForms = await Promise.all(
		forms.map(async (form) => {
			if (form.type === 'ADOPTION_SPECIFIC' && (form.data as any).catId) {
				const catData = await prisma.cat.findUnique({
					where: { id: (form.data as any).catId },
					include: {
						volunteers: {
							include: {
								volunteer: { include: { profil: true } }
							}
						}
					}
				});
				return { ...form, catData };
			}
			return { ...form, catData: null };
		})
	);

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
		forms: enrichedForms,
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

	createAdoption: async ({ request }) => {
		const formData = await request.formData();
		const raw = Object.fromEntries(formData);

		const parsed = createAdoptionSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				errors: parsed.error.flatten().fieldErrors
			});
		}

		try {
			const adoption = await createAdoption(parsed.data);
			return { success: true, adoptionId: adoption.id };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Erreur inconnue';
			return fail(400, { error: message });
		}
	}
};
