import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '#lib/server/prisma.ts';
import { District, VolunteerRole } from '@prisma/client';
import { createVolunteer, updateVolunteer } from '#lib/server/volunteers/mutations.ts';
import { deleteProfile } from '#lib/server/mutations.ts';
import { addToBlacklistAction } from '#lib/server/blacklist/actions.ts';
import { activeBlacklistArgs } from '#lib/types/blacklist.ts';
import { hasAdminRole, requireAdmin } from '#lib/server/permissions/roles.ts';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Page réservée à l'admin (avant le try : redirect() lance une exception)
	requireAdmin(locals);

	try {
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
				where: {
					...whereCondition,
					actif: {
						not: 'STOP'
					}
				}
			}),

			// 2. Profils incomplets (FIXE: pas de duplication)
			prisma.volunteer.count({
				where: {
					...whereCondition,
					profil: {
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
					createdAt: {
						gte: new Date(new Date().getFullYear(), 0, 1)
					}
				}
			})
		]);

		// 📋 Récupérer tous les bénévoles avec leurs données (avec filtres)
		const volunteers = await prisma.volunteer.findMany({
			where: whereCondition,
			include: {
				profil: {
					include: {
						host: true,
						// Sa blacklist active : badge dans la fiche + filtre « Blacklist »
						blacklists: activeBlacklistArgs
					}
				},
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
				createdAt: 'desc'
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
		try {
			const result = await createVolunteer({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur création bénévole:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updateVolunteer: async ({ request, locals }) => {
		try {
			const result = await updateVolunteer({ formData: await request.formData(), locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur mise à jour bénévole:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteProfile: async ({ request, locals }) => {
		try {
			if (!hasAdminRole(locals.user)) {
				return fail(403, { success: false, error: 'Non autorisé' });
			}

			const data = await request.formData();
			const profileId = data.get('profileId') as string;

			if (!profileId) {
				return fail(400, {
					success: false,
					error: 'ID manquant'
				});
			}

			return await deleteProfile(profileId);
		} catch (error) {
			console.error('Erreur suppression profil:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// Même action que la page Blacklist (admin uniquement, compte retrouvé par l'email)
	addToBlacklist: addToBlacklistAction
};
