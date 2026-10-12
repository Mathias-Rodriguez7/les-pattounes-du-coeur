import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { createCat, updateCat } from '$lib/server/cats/mutations';
import { deleteProfile } from '$lib/server/mutations';
import {
	createPlacements,
	updatePlacement,
	deletePlacement
} from '$lib/server/placements/mutations';
import type { UpdatePlacementInput } from '$lib/schemas/placement';
import { createSickness, updateSickness, deleteSickness } from '$lib/server/sickness/mutations';
import { createCatVolunteer, deleteCatVolunteer } from '$lib/server/catVolunteer/mutations';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	try {
		const volunteerId = locals.user.id;

		const volunteer = await prisma.volunteer.findUnique({
			where: { id: volunteerId },
			select: { role: true }
		});

		if (!volunteer || !['ADMIN', 'MANAGER', 'COMMUNICATION'].includes(volunteer.role)) {
			redirect(302, '/');
		}

		const isAdmin = volunteer.role === 'ADMIN';

		// ✅ ADMIN voit tout, MANAGER/COMMUNICATION voient seulement leurs chats assignés
		const catsWhere = isAdmin ? {} : { volunteers: { some: { volunteerId } } };

		const yearStart = new Date(new Date().getFullYear(), 0, 1);

		const [cats, managedByUser, incompleteProfiles, visibleCats, socializingCats, adoptedThisYear] =
			await Promise.all([
				prisma.cat.findMany({
					where: catsWhere,
					include: {
						media: true,
						sicknesses: true,
						placements: {
							include: {
								host: { include: { profil: true } }
							}
						},
						volunteers: {
							include: {
								volunteer: { include: { profil: true } }
							}
						},
						adoptions: { include: { profil: true } }
					},
					orderBy: { created_at: 'desc' }
				}),

				prisma.cat.count({
					where: { volunteers: { some: { volunteerId } } }
				}),

				prisma.cat.count({
					where: {
						...catsWhere,
						OR: [{ isOkCat: false }, { isOkDog: false }, { isOutside: false }]
					}
				}),

				prisma.cat.count({
					where: { ...catsWhere, isVisible: true }
				}),

				prisma.cat.count({
					where: { ...catsWhere, status: 'SOCIALIZE' }
				}),

				prisma.cat.count({
					where: {
						...catsWhere,
						status: 'ADOPTED',
						updated_at: { gte: yearStart }
					}
				})
			]);

		const hosts = await prisma.host.findMany({
			include: { profil: true }
		});

		const volunteers = await prisma.volunteer.findMany({
			include: { profil: true }
		});

		const catsWithOwnership = cats.map((cat) => ({
			...cat,
			isMine: cat.volunteers.some((cv) => cv.volunteerId === volunteerId)
		}));

		return {
			cats: catsWithOwnership,
			stats: {
				managedByUser,
				incompleteProfiles,
				visibleCats,
				socializingCats,
				adoptedThisYear
			},
			hosts,
			volunteers,
			isAdmin
		};
	} catch (error) {
		console.error('Erreur lors du chargement des chats:', error);
		throw error;
	}
};

export const actions: Actions = {
	// ==========================================
	// ACTION: Cat
	// ==========================================
	createCat: async ({ request, locals }) => {
		try {
			const result = await createCat({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur création chat:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updateCat: async ({ request, locals }) => {
		try {
			const result = await updateCat({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur updateCat:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteProfile: async ({ request }) => {
		try {
			const data = await request.formData();
			const profileId = data.get('profileId') as string;

			if (!profileId) {
				return fail(400, { success: false, error: 'ID manquant' });
			}

			return await deleteProfile(profileId);
		} catch (error) {
			console.error('Erreur suppression profil:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: Placement
	// ==========================================
	createPlacement: async ({ request }) => {
		try {
			const formData = await request.formData();

			const catId = formData.get('catId')?.toString() ?? '';
			const hostIds = formData.getAll('hostIds').map((v) => v.toString());
			const type = formData.get('type')?.toString() ?? '';
			const status = formData.get('status')?.toString() ?? '';
			const notes = formData.get('notes')?.toString() || '';

			if (!catId) {
				return fail(400, { success: false, error: 'catId manquant' });
			}

			if (hostIds.length === 0) {
				return fail(400, { success: false, error: 'Aucun hôte sélectionné' });
			}

			const result = await createPlacements({ catId, hostIds, type, status, notes });

			if (!result.success) {
				return fail(400, result);
			}

			return result;
		} catch (error) {
			console.error('Erreur createPlacement:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updatePlacement: async ({ request }) => {
		try {
			const formData = await request.formData();
			const placementId = formData.get('placementId')?.toString();

			if (!placementId) {
				return fail(400, { success: false, error: 'placementId manquant' });
			}

			const input = {
				hostId: formData.get('hostId')?.toString() || undefined,
				type: formData.get('type')?.toString() || undefined,
				status: formData.get('status')?.toString() || undefined,
				startedDate: formData.get('startedDate')?.toString() || null,
				endedDate: formData.get('endedDate')?.toString() || null,
				notes: formData.get('notes')?.toString() || undefined
			};

			const result = await updatePlacement(placementId, input as UpdatePlacementInput);

			if (!result.success) {
				return fail(400, result);
			}

			return result;
		} catch (error) {
			console.error('Erreur updatePlacement:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deletePlacement: async ({ request }) => {
		try {
			const formData = await request.formData();
			const placementId = formData.get('placementId')?.toString();

			if (!placementId) {
				return fail(400, { success: false, error: 'placementId manquant' });
			}

			const result = await deletePlacement(placementId);

			if (!result.success) {
				return fail(400, result);
			}

			return result;
		} catch (error) {
			console.error('Erreur deletePlacement:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: Sickness
	// ==========================================
	createSickness: async ({ request, locals }) => {
		try {
			const result = await createSickness({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur createSickness:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updateSickness: async ({ request, locals }) => {
		try {
			const result = await updateSickness({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur updateSickness:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteSickness: async ({ request, locals }) => {
		try {
			const result = await deleteSickness({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur deleteSickness:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: CatVolunteer
	// ==========================================
	assignCatVolunteer: async ({ request, locals }) => {
		try {
			const result = await createCatVolunteer({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur assignCatVolunteer:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	removeCatVolunteer: async ({ request, locals }) => {
		try {
			const result = await deleteCatVolunteer({ request, locals });
			if (!result.success) {
				return fail(400, result);
			}
			return result;
		} catch (error) {
			console.error('Erreur removeCatVolunteer:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	}
};
