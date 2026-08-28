import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { District, VolunteerRole } from '@prisma/client';

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
		// ✅ Vérifier que c'est un ADMIN
		if (!locals.user || locals.user.role !== 'ADMIN') {
			return fail(403, { error: 'Non autorisé' });
		}

		const formData = await request.formData();

		const firstName = formData.get('firstName')?.toString().trim();
		const lastName = formData.get('lastName')?.toString().trim();
		const email = formData.get('email')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const address = formData.get('address')?.toString().trim();
		const city = formData.get('city')?.toString().trim();
		const postalCode = formData.get('postalCode')?.toString().trim();
		const districtValue = formData.get('district')?.toString().trim() as District | undefined;
		const roleValue = (formData.get('role')?.toString().trim() || 'MANAGER') as VolunteerRole;

		// 👇 Valide tous les champs SAUF district (optionnel)
		if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
			return fail(400, { error: 'Tous les champs sont obligatoires' });
		}

		// ✅ Valide que le district existe (si fourni)
		if (districtValue && !Object.values(District).includes(districtValue)) {
			return fail(400, { error: 'District invalide' });
		}

		// ✅ Valide que le rôle existe
		if (!Object.values(VolunteerRole).includes(roleValue)) {
			return fail(400, { error: 'Rôle invalide' });
		}

		try {
			const profil = await prisma.profil.create({
				data: {
					firstName,
					lastName,
					email,
					phone,
					address,
					city,
					postalCode,
					...(districtValue && { district: districtValue }) // ✅ Optionnel
				}
			});

			await prisma.volunteer.create({
				data: {
					profilId: profil.id,
					password: 'TempPassword123!',
					role: roleValue,
					actif: 'ACTIVE'
				}
			});

			return { success: true };
		} catch (error) {
			console.error('Erreur création volunteer:', error);
			return fail(500, { error: 'Erreur lors de la création' });
		}
	}
};
