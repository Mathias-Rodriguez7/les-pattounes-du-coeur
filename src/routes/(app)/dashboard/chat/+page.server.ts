import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { createCat, updateCat, deleteCat } from '$lib/server/cats/mutations';
import {
	createPlacements,
	updatePlacement,
	deletePlacement
} from '$lib/server/placements/mutations';
import type { UpdatePlacementInput } from '$lib/schemas/placement';
import { createSickness, updateSickness, deleteSickness } from '$lib/server/sickness/mutations';
import { createCatVolunteer, deleteCatVolunteer } from '$lib/server/catVolunteer/mutations';
import { createCatDocument, deleteCatDocument } from '$lib/server/catDocuments/mutations';
import { canManageCat, canManagePlacement } from '$lib/server/permissions/cat';
import { catFullArgs } from '$lib/types/cat';
import { hostFullArgs } from '$lib/types/host';
import { createCare, deleteCare } from '$lib/server/cares/mutations';
import {
	addCatMedia,
	setPrimaryCatMedia,
	deleteCatMedia,
	updateCatMediaFocalPoint
} from '$lib/server/catMedia/mutations';
import { finalizeAdoption } from '$lib/server/adoptions/mutations';
import { finalizeAdoptionSchema } from '$lib/schemas/adoption';
import { createAdoptionAction } from '$lib/server/adoptions/actions';
import { attachBlacklist, findActiveBlacklists } from '$lib/server/accountStatus';
import { updateForm, rejectForm } from '$lib/server/forms/mutations';

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
					...catFullArgs,
					orderBy: { createdAt: 'desc' }
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
						updatedAt: { gte: yearStart }
					}
				})
			]);

		// Avec leurs placements : nécessaires pour le score de compatibilité et « Chats actuels »
		const hosts = await prisma.host.findMany(hostFullArgs);

		// Juste ce qu'il faut pour la liste « Associer une bénévole »
		const volunteers = await prisma.volunteer.findMany({
			select: { id: true, profil: { select: { firstName: true, lastName: true } } }
		});

		// Les demandes en attente de chaque chat, avec leur éventuelle liste noire :
		// UNE requête pour tous les emails (pas une par chat)
		const blacklists = await findActiveBlacklists(
			cats.flatMap((cat) => cat.forms.map((form) => form.email))
		);
		const catsWithOwnership = cats.map((cat) => ({
			...cat,
			forms: cat.forms.map((form) => attachBlacklist(form, blacklists)),
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

	deleteCat: async ({ request, locals }) => {
		try {
			const result = await deleteCat({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur deleteCat:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: Placement
	// Mêmes droits que le chat : admin, ou bénévole associée
	// ==========================================
	createPlacement: async ({ request, locals }) => {
		try {
			if (!locals.user) {
				return fail(401, { success: false, error: 'Non autorisé' });
			}

			const formData = await request.formData();

			const catId = formData.get('catId')?.toString() ?? '';
			const hostIds = formData.getAll('hostIds').map((v) => v.toString());
			const type = formData.get('type')?.toString() ?? '';
			const status = formData.get('status')?.toString() ?? '';

			if (!catId) {
				return fail(400, { success: false, error: 'catId manquant' });
			}

			if (hostIds.length === 0) {
				return fail(400, { success: false, error: 'Aucun hôte sélectionné' });
			}

			if (!(await canManageCat(locals.user, catId))) {
				return fail(403, { success: false, error: "Vous n'avez pas le droit de placer ce chat" });
			}

			const result = await createPlacements({ catId, hostIds, type, status });

			if (!result.success) {
				return fail(400, result);
			}

			return result;
		} catch (error) {
			console.error('Erreur createPlacement:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updatePlacement: async ({ request, locals }) => {
		try {
			if (!locals.user) {
				return fail(401, { success: false, error: 'Non autorisé' });
			}

			const formData = await request.formData();
			const placementId = formData.get('placementId')?.toString();

			if (!placementId) {
				return fail(400, { success: false, error: 'placementId manquant' });
			}

			// Le chat est lu en base, pas dans le formulaire
			if (!(await canManagePlacement(locals.user, placementId))) {
				return fail(403, {
					success: false,
					error: "Vous n'avez pas le droit de modifier ce placement"
				});
			}

			// ⚠️ Mêmes noms que les champs de PlacementEditForm (startDate / endDate)
			const input = {
				hostId: formData.get('hostId')?.toString() || undefined,
				type: formData.get('type')?.toString() || undefined,
				status: formData.get('status')?.toString() || undefined,
				startDate: formData.get('startDate')?.toString() || null,
				endDate: formData.get('endDate')?.toString() || null
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

	deletePlacement: async ({ request, locals }) => {
		try {
			if (!locals.user) {
				return fail(401, { success: false, error: 'Non autorisé' });
			}

			const formData = await request.formData();
			const placementId = formData.get('placementId')?.toString();

			if (!placementId) {
				return fail(400, { success: false, error: 'placementId manquant' });
			}

			if (!(await canManagePlacement(locals.user, placementId))) {
				return fail(403, {
					success: false,
					error: "Vous n'avez pas le droit de supprimer ce placement"
				});
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
	},

	// ==========================================
	// ACTION: Documents du chat
	// ==========================================
	createCatDocument: async ({ request, locals }) => {
		try {
			const result = await createCatDocument({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur createCatDocument:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteCatDocument: async ({ request, locals }) => {
		try {
			const result = await deleteCatDocument({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur deleteCatDocument:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: care du chat
	// ==========================================
	createCare: async ({ request, locals }) => {
		try {
			const result = await createCare({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur createCare:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteCare: async ({ request, locals }) => {
		try {
			const result = await deleteCare({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur deleteCare:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: Media du chat
	// ==========================================
	addCatMedia: async ({ request, locals }) => {
		try {
			const result = await addCatMedia({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur addCatMedia:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	setPrimaryCatMedia: async ({ request, locals }) => {
		try {
			const result = await setPrimaryCatMedia({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur setPrimaryCatMedia:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	updateCatMediaFocalPoint: async ({ request, locals }) => {
		try {
			const result = await updateCatMediaFocalPoint({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur updateCatMediaFocalPoint:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	deleteCatMedia: async ({ request, locals }) => {
		try {
			const result = await deleteCatMedia({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur deleteCatMedia:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: Demandes d'adoption du chat — mêmes fonctions que la page Formulaires
	// (les panneaux envoient à ?/updateForm et ?/rejectForm : la page doit les avoir)
	// ==========================================
	updateForm: async ({ request, locals }) => {
		try {
			const result = await updateForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur mise à jour demande:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	rejectForm: async ({ request, locals }) => {
		try {
			const result = await rejectForm({ request, locals });
			if (!result.success) return fail(400, result);
			return result;
		} catch (error) {
			console.error('Erreur refus demande:', error);
			return fail(500, { success: false, error: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION: Adoption — depuis la fiche du chat
	// ==========================================
	createAdoption: createAdoptionAction,

	finalizeAdoption: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { success: false, error: 'Non autorisé' });
		}

		const parsed = finalizeAdoptionSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, {
				success: false,
				error: 'Erreur de validation',
				errors: parsed.error.flatten().fieldErrors
			});
		}
		const { adoptionId } = parsed.data;

		// Le droit se vérifie sur le chat de l'adoption, lu en base (pas envoyé par le navigateur)
		const adoption = await prisma.adoption.findUnique({
			where: { id: adoptionId },
			select: { catId: true }
		});
		if (!adoption || !(await canManageCat(locals.user, adoption.catId))) {
			return fail(403, {
				success: false,
				error: "Vous n'avez pas le droit de finaliser cette adoption"
			});
		}

		try {
			const { removedCount } = await finalizeAdoption(adoptionId);
			const removedMessage =
				removedCount === 0
					? ''
					: removedCount === 1
						? ' 1 média de la galerie a été supprimé.'
						: ` ${removedCount} médias de la galerie ont été supprimés.`;
			return { success: true, message: `Adoption définitive 🎉${removedMessage}` };
		} catch (error) {
			// Les messages de finalizeAdoption sont écrits pour l'utilisatrice
			const message = error instanceof Error ? error.message : 'Erreur inconnue';
			return fail(400, { success: false, error: message });
		}
	}
};
