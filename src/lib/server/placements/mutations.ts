import prisma from '$lib/server/prisma';
import {
	createPlacementSchema,
	updatePlacementSchema,
	type CreatePlacementInput,
	type UpdatePlacementInput
} from './schemas';

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
				startedDate: startedDate ?? new Date(),
				endedDate: endedDate ?? null,
				notes: notes ?? ''
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
