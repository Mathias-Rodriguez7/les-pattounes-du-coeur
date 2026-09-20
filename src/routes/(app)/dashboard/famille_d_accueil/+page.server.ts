import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { District } from '@prisma/client';
import { createHost, updateHost } from '$lib/server/hosts/mutations';
import { deleteProfile, blacklistProfile } from '$lib/server/mutations';

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

		// ✅ Valide les filtres (district optionnel)
		const districtFilter =
			districtParam && Object.values(District).includes(districtParam as District)
				? (districtParam as District)
				: undefined;

		// 🏗️ Construire la condition WHERE
		const whereCondition = {
			...(districtFilter && { profil: { district: districtFilter } })
		};

		// 📊 Récupérer les STATS (avec filtres)
		const [totalHosts, incompleteProfiles, activeHosts, breakHosts, recruitedThisYear] =
			await Promise.all([
				// 1. Total de familles d'accueil
				prisma.host.count({
					where: {
						...whereCondition,
						actif: {
							not: 'STOP'
						}
					}
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

		// ✅ NOUVEAU : Calculer les stats de placements pour chaque host
		const hostsWithStats = hosts.map((host) => {
			const long = host.placements.filter((p) => p.type === 'LONG').length;
			const short = host.placements.filter((p) => p.type === 'SHORT').length;

			const placementStats = {
				long,
				short,
				total: long + short
			};

			return {
				...host,
				placementStats
			};
		});

		return {
			hosts: hostsWithStats, // ✅ Utilise hostsWithStats au lieu de hosts
			stats: {
				totalHosts,
				incompleteProfiles,
				activeHosts,
				breakHosts,
				recruitedThisYear
			},
			isAdmin: true,
			filters: {
				district: districtFilter || null
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
			return fail(400, result);
		}
		return result;
	},

	updateHost: async ({ request }) => {
		const result = await updateHost({ request });
		if (!result.success) {
			return fail(400, result);
		}
		return result;
	},

	deleteProfile: async ({ request }) => {
		const data = await request.formData();
		const profileId = data.get('profileId') as string;

		if (!profileId) {
			return {
				success: false,
				error: 'ID manquant'
			};
		}

		return await deleteProfile(profileId);
	},

	blacklistProfile: async ({ request, locals }) => {
		// ✅ Vérifier les permissions
		if (!locals.user || locals.user.role !== 'ADMIN') {
			return fail(403, { error: 'Non autorisé' });
		}

		const data = await request.formData();
		const profileId = data.get('profileId') as string;
		const email = data.get('email') as string;
		const description = data.get('description') as string;

		if (!profileId || !email) {
			return fail(400, { error: 'Données manquantes' });
		}

		return await blacklistProfile(profileId, email, description || '');
	}
};
