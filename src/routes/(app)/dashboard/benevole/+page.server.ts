import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
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

		// 📊 Récupérer les STATS
		const [
			totalVolunteers,
			incompleteProfiles,
			activeVolunteers,
			pausedVolunteers,
			recruitedThisYear
		] = await Promise.all([
			// 1. Total de bénévoles
			prisma.volunteer.count(),

			// 2. Profils incomplets - Version robuste
			prisma.volunteer.count({
				where: {
					profil: {
						OR: [{ firstName: '' }, { lastName: '' }, { phone: '' }, { email: '' }, { address: '' }]
					}
				}
			}),

			// 3. Bénévoles en activité
			prisma.volunteer.count({
				where: {
					actif: 'ACTIVE'
				}
			}),

			// 4. Bénévoles en pause
			prisma.volunteer.count({
				where: {
					actif: 'BREAK'
				}
			}),

			// 5. Bénévoles recrutés cette année
			prisma.volunteer.count({
				where: {
					created_at: {
						gte: new Date(new Date().getFullYear(), 0, 1)
					}
				}
			})
		]);

		// 📋 Récupérer tous les bénévoles avec leurs données
		const volunteers = await prisma.volunteer.findMany({
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
			isAdmin: true
		};
	} catch (error) {
		console.error('Erreur lors du chargement des bénévoles:', error);
		throw error;
	}
};
