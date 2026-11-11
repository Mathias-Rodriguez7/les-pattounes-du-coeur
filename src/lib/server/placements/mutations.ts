import prisma from '$lib/server/prisma';
import {
	createPlacementSchema,
	updatePlacementSchema,
	type CreatePlacementInput,
	type UpdatePlacementInput
} from '../../schemas/placement';
import { placementHasDates } from '$lib/constants/placement';

// ==========================================
// CREATE - Créer un placement
// ⚠️ Ne vérifie pas les droits : c'est le rôle de l'action qui l'appelle
// ==========================================
export async function createPlacement(input: CreatePlacementInput) {
	const parsed = createPlacementSchema.safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			error: 'Données invalides',
			errors: parsed.error.flatten().fieldErrors,
			data: null
		};
	}

	const { catId, hostId, type, status, startDate, endDate } = parsed.data;

	try {
		const placement = await prisma.placement.create({
			data: {
				catId,
				hostId,
				type,
				status,
				// Dates uniquement pour un placement réel (classique ou relais)
				startDate: placementHasDates(type) ? (startDate ?? new Date()) : null,
				endDate: placementHasDates(type) ? (endDate ?? null) : null
			},
			include: {
				cat: true,
				host: { include: { profil: true } }
			}
		});

		return {
			success: true,
			message: 'Placement créé avec succès',
			data: placement
		};
	} catch (error) {
		console.error('❌ ERREUR createPlacement:', error);
		return {
			success: false,
			error: 'Erreur lors de la création du placement',
			data: null
		};
	}
}

// ==========================================
// CREATE MULTIPLE - Proposer un chat à plusieurs FA
// Même type et même statut pour toutes, sans dates
// (les dates seront renseignées lors de l'update,
// quand une FA confirme le placement)
// ==========================================
interface CreatePlacementsInput {
	catId: string;
	hostIds: string[];
	type: string;
	status: string;
}

export async function createPlacements(input: CreatePlacementsInput) {
	const { catId, hostIds, type, status } = input;

	if (!catId || hostIds.length === 0) {
		return {
			success: false,
			error: 'catId ou hostIds manquant',
			data: null
		};
	}

	const results = [];
	const errors: Array<{ hostId: string; error?: string; errors?: unknown }> = [];

	for (const hostId of hostIds) {
		const placementInput = {
			catId,
			hostId,
			type,
			status,
			startDate: null,
			endDate: null
		} as CreatePlacementInput;

		const result = await createPlacement(placementInput);

		if (!result.success) {
			errors.push({ hostId, error: result.error, errors: result.errors });
		} else {
			results.push(result.data);
		}
	}

	if (results.length === 0) {
		return {
			success: false,
			error: 'Aucun placement créé',
			errors,
			data: null
		};
	}

	if (errors.length > 0) {
		return {
			success: true,
			message: `${results.length} placement(s) créé(s), ${errors.length} échec(s)`,
			data: results,
			partialErrors: errors
		};
	}

	return {
		success: true,
		message:
			results.length > 1
				? `${results.length} placements créés avec succès`
				: 'Placement créé avec succès',
		data: results
	};
}

// ==========================================
// UPDATE - Mettre à jour un placement
// ⚠️ Ne vérifie pas les droits : c'est le rôle de l'action qui l'appelle
// ==========================================
export async function updatePlacement(placementId: string, input: UpdatePlacementInput) {
	const parsed = updatePlacementSchema.safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			error: 'Données invalides',
			errors: parsed.error.flatten().fieldErrors,
			data: null
		};
	}

	const data = parsed.data;

	// Le type FINAL décide : celui du formulaire, sinon celui déjà en base
	const finalType =
		data.type ??
		(await prisma.placement.findUnique({ where: { id: placementId }, select: { type: true } }))
			?.type;

	if (!placementHasDates(finalType)) {
		data.startDate = null;
		data.endDate = null;
	}

	try {
		const placement = await prisma.placement.update({
			where: { id: placementId },
			data,
			include: {
				cat: true,
				host: { include: { profil: true } }
			}
		});

		return {
			success: true,
			message: 'Placement mis à jour avec succès',
			data: placement
		};
	} catch (error) {
		console.error('❌ ERREUR updatePlacement:', error);
		return {
			success: false,
			error: 'Erreur lors de la mise à jour du placement',
			data: null
		};
	}
}

// ==========================================
// DELETE - Supprimer un placement
// Pas de restriction de type : permet de corriger une erreur
// de création, quel que soit le type (LONG/SHORT compris)
// ⚠️ Ne vérifie pas les droits : c'est le rôle de l'action qui l'appelle
// ==========================================
export async function deletePlacement(placementId: string) {
	try {
		await prisma.placement.delete({
			where: { id: placementId }
		});

		return {
			success: true,
			message: 'Placement supprimé avec succès'
		};
	} catch (error) {
		console.error('❌ ERREUR deletePlacement:', error);
		return {
			success: false,
			error: 'Erreur lors de la suppression du placement'
		};
	}
}
