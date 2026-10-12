import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { FormType, FormStatus } from '@prisma/client';
import { updateForm } from '$lib/server/forms/mutations';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const volunteerId = locals.user.id;
	const volunteer = await prisma.volunteer.findUnique({
		where: { id: volunteerId },
		select: { role: true }
	});

	if (!volunteer) {
		redirect(302, '/');
	}

	const isAdmin = volunteer.role === 'ADMIN';

	// 🔍 Récupérer les filtres depuis les query params
	const typeParam = url.searchParams.get('type');
	const statusParam = url.searchParams.get('status');

	const typeFilter =
		typeParam && Object.values(FormType).includes(typeParam as FormType)
			? (typeParam as FormType)
			: undefined;

	const statusFilter =
		statusParam && Object.values(FormStatus).includes(statusParam as FormStatus)
			? (statusParam as FormStatus)
			: undefined;

	// 🏗️ Construire la condition WHERE
	const whereCondition = {
		...(typeFilter && { type: typeFilter }),
		...(statusFilter && { status: statusFilter }),
		// Si pas ADMIN, afficher seulement les forms assignés à ce volunteer
		...(!isAdmin && { assignedToId: volunteerId })
	};

	// 📊 Récupérer les STATS
	const [totalForms, pendingForms, approvedForms, rejectedForms] = await Promise.all([
		prisma.form.count({
			where: whereCondition
		}),
		prisma.form.count({
			where: { ...whereCondition, status: 'PENDING' }
		}),
		prisma.form.count({
			where: { ...whereCondition, status: 'APPROVED' }
		}),
		prisma.form.count({
			where: { ...whereCondition, status: 'REJECTED' }
		})
	]);

	// 📋 Récupérer tous les forms
	const forms = await prisma.form.findMany({
		where: whereCondition,
		include: {
			assignedTo: {
				include: {
					profil: {
						select: {
							firstName: true,
							lastName: true
						}
					}
				}
			}
		},
		orderBy: {
			created_at: 'desc'
		}
	});

	// 📋 Récupérer tous les volunteers pour l'assignment (seulement pour ADMIN)
	const volunteers = isAdmin
		? await prisma.volunteer.findMany({
				include: {
					profil: {
						select: {
							firstName: true,
							lastName: true
						}
					}
				},
				orderBy: {
					profil: {
						firstName: 'asc'
					}
				}
			})
		: [];

	return {
		forms,
		volunteers,
		stats: {
			totalForms,
			pendingForms,
			approvedForms,
			rejectedForms
		},
		isAdmin,
		filters: {
			type: typeFilter || null,
			status: statusFilter || null
		}
	};
};

export const actions: Actions = {
	updateForm: async ({ request, locals }) => {
		try {
			const result = await updateForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur mise à jour form:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	}
};
