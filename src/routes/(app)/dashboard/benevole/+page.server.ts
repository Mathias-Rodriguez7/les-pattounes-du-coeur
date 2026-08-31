import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { District, VolunteerRole } from '@prisma/client';
import {
	createVolunteer,
	updateVolunteer,
	deleteVolunteer
} from '$lib/server/volunteers/mutations';

export const load: PageServerLoad = async ({ locals, url }) => {
	// ✅ Vérifier que l'user existe ET est ADMIN
	if (!locals.user) {
		redirect(302, '/');
	}

	try {
		const volunteerId = locals.user.id;

		// Vérifier que l'utilisateur est ADMIN
		const volunteer = await prisma.volunteer.findUnique({
			where: { id: volunteerId },
			select: { role: true }
		});

		if (volunteer?.role !== 'ADMIN') {
			redirect(302, '/');
		}

		// 🔍 Récupérer les filtres depuis les query params
		const districtParam = url.searchParams.get('district');
		const roleParam = url.searchParams.get('role');

		// ✅ Valide les filtres (district optionnel)
		const districtFilter =
			districtParam && Object.values(District).includes(districtParam as District)
				? (districtParam as District)
				: undefined;

		const roleFilter =
			roleParam && Object.values(VolunteerRole).includes(roleParam as VolunteerRole)
				? (roleParam as VolunteerRole)
				: undefined;

		// 🏗️ Construire la condition WHERE
		const whereCondition = {
			...(districtFilter && { profil: { district: districtFilter } }),
			...(roleFilter && { role: roleFilter })
		};

		// 📊 Récupérer les STATS (avec filtres)
		const [
			totalVolunteers,
			incompleteProfiles,
			activeVolunteers,
			pausedVolunteers,
			recruitedThisYear
		] = await Promise.all([
			// 1. Total de bénévoles
			prisma.volunteer.count({
				where: whereCondition
			}),

			// 2. Profils incomplets
			prisma.volunteer.count({
				where: {
					...whereCondition,
					profil: {
						...(districtFilter && { district: districtFilter }),
						OR: [{ firstName: '' }, { lastName: '' }, { phone: '' }, { email: '' }, { address: '' }]
					}
				}
			}),

			// 3. Bénévoles en activité
			prisma.volunteer.count({
				where: {
					...whereCondition,
					actif: 'ACTIVE'
				}
			}),

			// 4. Bénévoles en pause
			prisma.volunteer.count({
				where: {
					...whereCondition,
					actif: 'BREAK'
				}
			}),

			// 5. Bénévoles recrutés cette année
			prisma.volunteer.count({
				where: {
					...whereCondition,
					created_at: {
						gte: new Date(new Date().getFullYear(), 0, 1)
					}
				}
			})
		]);

		// 📋 Récupérer tous les bénévoles avec leurs données (avec filtres)
		const volunteers = await prisma.volunteer.findMany({
			where: whereCondition,
			include: {
				profil: true,
				cats: {
					include: {
						cat: {
							select: {
								id: true,
								name: true,
								status: true,
								placements: {
									include: {
										host: {
											include: {
												profil: {
													select: {
														firstName: true,
														lastName: true
													}
												}
											}
										}
									}
								}
							}
						}
					}
				},
				assignedForms: true
			},
			orderBy: {
				created_at: 'desc'
			}
		});

		return {
			volunteers,
			stats: {
				totalVolunteers,
				incompleteProfiles,
				activeVolunteers,
				pausedVolunteers,
				recruitedThisYear
			},
			isAdmin: true,
			filters: {
				district: districtFilter || null,
				role: roleFilter || null
			}
		};
	} catch (error) {
		console.error('Erreur lors du chargement des bénévoles:', error);
		throw error;
	}
};

export const actions: Actions = {
	createVolunteer: async ({ request, locals }) => {
		const result = await createVolunteer({ request, locals });
		if (!result.success) {
			return fail(400, result); // ✅ Retourne les erreurs Zod
		}
		return result;
	},

	updateVolunteer: async ({ request }) => {
		const result = await updateVolunteer({ request });
		if (!result.success) {
			return fail(400, result); // ✅ Retourne les erreurs Zod
		}
		return result;
	},

	deleteVolunteer: async ({ request }) => {
		const formData = await request.formData();
		const volunteerId = formData.get('volunteerId') as string;

		const result = await deleteVolunteer(volunteerId);
		if (!result.success) {
			return fail(400, result); // ✅ Retourne les erreurs Zod
		}
		return result;
	}
};
