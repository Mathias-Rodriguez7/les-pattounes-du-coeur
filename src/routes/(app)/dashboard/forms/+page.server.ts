import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { FormType, FormStatus } from '@prisma/client';

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
	updateFormStatus: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { success: false, error: 'Non autorisé' });
		}

		const data = await request.formData();
		const formId = data.get('formId') as string;
		const status = data.get('status') as FormStatus;

		const volunteer = await prisma.volunteer.findUnique({
			where: { id: locals.user.id },
			select: { role: true }
		});

		if (!volunteer) {
			return fail(401, { success: false, error: 'Volunteer non trouvé' });
		}

		// Vérifier les permissions
		const form = await prisma.form.findUnique({
			where: { id: formId }
		});

		if (!form) {
			return fail(404, { success: false, error: 'Form non trouvé' });
		}

		// Si pas ADMIN, vérifier que le form est assigné à ce volunteer
		if (volunteer.role !== 'ADMIN' && form.assignedToId !== locals.user.id) {
			return fail(403, { success: false, error: 'Non autorisé' });
		}

		try {
			await prisma.form.update({
				where: { id: formId },
				data: { status }
			});

			return { success: true };
		} catch (error) {
			console.error('Erreur mise à jour form status:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	assignForm: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { success: false, error: 'Non autorisé' });
		}

		const volunteer = await prisma.volunteer.findUnique({
			where: { id: locals.user.id },
			select: { role: true }
		});

		if (volunteer?.role !== 'ADMIN') {
			return fail(403, { success: false, error: 'Seulement les ADMIN' });
		}

		const data = await request.formData();
		const formId = data.get('formId') as string;
		const assignedToId = data.get('assignedToId') as string;

		if (!formId || !assignedToId) {
			return fail(400, { success: false, error: 'Données manquantes' });
		}

		try {
			await prisma.form.update({
				where: { id: formId },
				data: { assignedToId }
			});

			return { success: true };
		} catch (error) {
			console.error('Erreur assignment form:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteForm: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { success: false, error: 'Non autorisé' });
		}

		const volunteer = await prisma.volunteer.findUnique({
			where: { id: locals.user.id },
			select: { role: true }
		});

		if (volunteer?.role !== 'ADMIN') {
			return fail(403, { success: false, error: 'Seulement les ADMIN' });
		}

		const data = await request.formData();
		const formId = data.get('formId') as string;

		if (!formId) {
			return fail(400, { success: false, error: 'ID manquant' });
		}

		try {
			await prisma.form.delete({
				where: { id: formId }
			});

			return { success: true };
		} catch (error) {
			console.error('Erreur suppression form:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	}
};
