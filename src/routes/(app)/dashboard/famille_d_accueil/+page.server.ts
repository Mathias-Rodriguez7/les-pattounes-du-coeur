import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { District, HostStatus } from '@prisma/client';
import { createHost, updateHost, deleteHost } from '$lib/server/hosts/mutations';

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
		const statusParam = url.searchParams.get('status');

		// ✅ Valide les filtres (district optionnel)
		const districtFilter =
			districtParam && Object.values(District).includes(districtParam as District)
				? (districtParam as District)
				: undefined;

		const statusFilter =
			statusParam && Object.values(HostStatus).includes(statusParam as HostStatus)
				? (statusParam as HostStatus)
				: undefined;

		// 🏗️ Construire la condition WHERE
		const whereCondition = {
			...(districtFilter && { profil: { district: districtFilter } }),
			...(statusFilter && { status: statusFilter })
		};

		// 📊 Récupérer les STATS (avec filtres)
		const [totalHosts, incompleteProfiles, activeHosts, breakHosts, recruitedThisYear] =
			await Promise.all([
				// 1. Total de familles d'accueil
				prisma.host.count({
					where: whereCondition
				}),

				// 2. Profils incomplets
				prisma.host.count({
					where: {
						...whereCondition,
						profil: {
							...(districtFilter && { district: districtFilter }),
							OR: [
								{ firstName: '' },
								{ lastName: '' },
								{ phone: '' },
								{ email: '' },
								{ address: '' }
							]
						}
					}
				}),

				// 3. Familles en activité
				prisma.host.count({
					where: {
						...whereCondition,
						actif: 'ACTIVE'
					}
				}),

				// 4. Familles en pause
				prisma.host.count({
					where: {
						...whereCondition,
						actif: 'BREAK'
					}
				}),

				// 5. Familles recrutées cette année
				prisma.host.count({
					where: {
						...whereCondition,
						created_at: {
							gte: new Date(new Date().getFullYear(), 0, 1)
						}
					}
				})
			]);

		// 📋 Récupérer toutes les familles avec leurs données (avec filtres)
		const hosts = await prisma.host.findMany({
			where: whereCondition,
			include: {
				profil: true,
				placements: {
					include: {
						cat: {
							select: {
								id: true,
								name: true,
								status: true,
								media: {
									select: {
										picture: true
									}
								}
							}
						}
					}
				}
			},
			orderBy: {
				created_at: 'desc'
			}
		});

		return {
			hosts,
			stats: {
				totalHosts,
				incompleteProfiles,
				activeHosts,
				breakHosts,
				recruitedThisYear
			},
			isAdmin: true,
			filters: {
				district: districtFilter || null,
				status: statusFilter || null
			}
		};
	} catch (error) {
		console.error("Erreur lors du chargement des familles d'accueil:", error);
		throw error;
	}
};

export const actions: Actions = {
	createHost: async ({ request, locals }) => {
		const result = await createHost({ request, locals });
		if (!result.success) {
			return fail(400, result); // ✅ Retourne les erreurs Zod
		}
		return result;
	},

	updateHost: async ({ request }) => {
		const result = await updateHost({ request });
		if (!result.success) {
			return fail(400, result); // ✅ Retourne les erreurs Zod
		}
		return result;
	},

	deleteHost: async ({ request }) => {
		const formData = await request.formData();
		const hostId = formData.get('hostId') as string;

		const result = await deleteHost(hostId);
		if (!result.success) {
			return fail(400, result); // ✅ Retourne les erreurs Zod
		}
		return result;
	}
};
