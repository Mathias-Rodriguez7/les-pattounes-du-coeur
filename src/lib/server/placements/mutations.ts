import prisma from '$lib/server/prisma';
import {
	createPlacementSchema,
	updatePlacementSchema,
	type CreatePlacementInput,
	type UpdatePlacementInput
} from '../../schemas/placement';

// ==========================================
// CREATE - Créer un placement
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

	const { catId, hostId, type, status, startedDate, endedDate, notes } = parsed.data;

	try {
		const placement = await prisma.placement.create({
			data: {
				catId,
				hostId,
				type,
				status,
				startDate: startedDate ?? new Date(),
				endDate: endedDate ?? null
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
// Même type/status/notes pour tous, pas de dates
// (les dates seront renseignées lors de l'update
// quand une FA confirme le placement)
// ==========================================
interface CreatePlacementsInput {
	catId: string;
	hostIds: string[];
	type: string;
	status: string;
}

export async function createPlacements(input: CreatePlacementsInput) {
	const { catId, hostIds, type, status, notes } = input;

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

	try {
		const placement = await prisma.placement.update({
			where: { id: placementId },
			data: parsed.data,
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
