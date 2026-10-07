import prisma from '$lib/server/prisma';
import {
	createSicknessSchema,
	updateSicknessSchema,
	type CreateSicknessInput,
	type UpdateSicknessInput
} from '../../schemas/sickness';

function convertFormData(formData: FormData): Record<string, string | null> {
	const data: Record<string, string | null> = {};

	for (const [key, value] of formData.entries()) {
		data[key] = (value as string) || null;
	}

	return data;
}

// ✅ Vérifie que le volontaire (MANAGER/COMMUNICATION) est bien associé au chat
async function isVolunteerAssignedToCat(volunteerId: string, catId: string): Promise<boolean> {
	const link = await prisma.catVolunteer.findFirst({
		where: { catId, volunteerId }
	});
	return !!link;
}

// ✅ Autorisation centralisée : ADMIN toujours OK, sinon vérifie l'association
async function canManageSicknessForCat(
	locals: App.Locals,
	catId: string
): Promise<{ authorized: boolean; error?: string }> {
	if (!locals.user) {
		return { authorized: false, error: 'Non autorisé' };
	}

	if (locals.user.role === 'ADMIN') {
		return { authorized: true };
	}

	if (locals.user.role === 'MANAGER' || locals.user.role === 'COMMUNICATION') {
		const isAssigned = await isVolunteerAssignedToCat(locals.user.id, catId);
		if (!isAssigned) {
			return { authorized: false, error: "Vous n'êtes pas associé à ce chat" };
		}
		return { authorized: true };
	}

	return { authorized: false, error: 'Non autorisé' };
}

// ==========================================
// CREATE
// ==========================================
export async function createSickness({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return { success: false, error: 'Non autorisé', errors: {} };
	}

	try {
		const formData = await request.formData();
		const rawData = convertFormData(formData);

		const catId = rawData.catId;
		if (!catId) {
			return { success: false, error: 'ID du chat manquant', errors: {} };
		}

		const { authorized, error } = await canManageSicknessForCat(locals, catId);
		if (!authorized) {
			return { success: false, error: error ?? 'Non autorisé', errors: {} };
		}

		// Conversion des dates string -> Date avant parse Zod
		const parsedInput = {
			...rawData,
			startDate: rawData.startDate ? new Date(rawData.startDate) : undefined,
			endDate: rawData.endDate ? new Date(rawData.endDate) : undefined,
			description: rawData.description ?? undefined,
			treatment: rawData.treatment ?? undefined,
			status: rawData.status ?? undefined
		};

		const parsed = createSicknessSchema.safeParse(parsedInput);

		if (!parsed.success) {
			const errors: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				errors[issue.path[0] as string] = issue.message;
			}
			return { success: false, error: 'Données invalides', errors };
		}

		const data: CreateSicknessInput = parsed.data;

		const sickness = await prisma.sickness.create({
			data: {
				catId: data.catId,
				name: data.name,
				description: data.description ?? null,
				treatment: data.treatment ?? null,
				startDate: data.startDate ?? null,
				endDate: data.endDate ?? null,
				status: data.status
			}
		});

		return {
			success: true,
			message: 'Maladie ajoutée avec succès',
			sickness,
			errors: {}
		};
	} catch (error) {
		console.error('❌ ERREUR CREATE Sickness:', error);
		return {
			success: false,
			error: 'Erreur lors de la création de la maladie',
			errors: {}
		};
	}
}

// ==========================================
// UPDATE
// ==========================================
export async function updateSickness({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return { success: false, error: 'Non autorisé', errors: {} };
	}

	try {
		const formData = await request.formData();
		const rawData = convertFormData(formData);

		const sicknessId = rawData.sicknessId;
		if (!sicknessId) {
			return { success: false, error: 'ID de la maladie manquant', errors: {} };
		}

		const existingSickness = await prisma.sickness.findUnique({
			where: { id: sicknessId }
		});

		if (!existingSickness) {
			return { success: false, error: 'Maladie non trouvée', errors: {} };
		}

		const { authorized, error } = await canManageSicknessForCat(locals, existingSickness.catId);
		if (!authorized) {
			return { success: false, error: error ?? 'Non autorisé', errors: {} };
		}

		const parsedInput = {
			...rawData,
			startDate: rawData.startDate ? new Date(rawData.startDate) : undefined,
			endDate: rawData.endDate ? new Date(rawData.endDate) : undefined,
			description: rawData.description ?? undefined,
			treatment: rawData.treatment ?? undefined,
			status: rawData.status ?? undefined,
			name: rawData.name ?? undefined
		};

		const parsed = updateSicknessSchema.safeParse(parsedInput);

		if (!parsed.success) {
			const errors: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				errors[issue.path[0] as string] = issue.message;
			}
			return { success: false, error: 'Données invalides', errors };
		}

		const data: UpdateSicknessInput = parsed.data;

		const sickness = await prisma.sickness.update({
			where: { id: sicknessId },
			data: {
				name: data.name ?? undefined,
				description: data.description ?? undefined,
				treatment: data.treatment ?? undefined,
				startDate: data.startDate ?? undefined,
				endDate: data.endDate ?? undefined,
				status: data.status ?? undefined
			}
		});

		return {
			success: true,
			message: 'Maladie mise à jour avec succès',
			sickness,
			errors: {}
		};
	} catch (error) {
		console.error('❌ ERREUR UPDATE Sickness:', error);
		return {
			success: false,
			error: 'Erreur lors de la mise à jour de la maladie',
			errors: {}
		};
	}
}

// ==========================================
// DELETE
// ==========================================
export async function deleteSickness({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return { success: false, error: 'Non autorisé', errors: {} };
	}

	try {
		const formData = await request.formData();
		const sicknessId = formData.get('sicknessId') as string;

		if (!sicknessId) {
			return {
				success: false,
				error: 'ID de la maladie manquant',
				errors: {}
			};
		}

		const existingSickness = await prisma.sickness.findUnique({
			where: { id: sicknessId }
		});

		if (!existingSickness) {
			return {
				success: false,
				error: 'Maladie non trouvée',
				errors: {}
			};
		}

		const { authorized, error } = await canManageSicknessForCat(locals, existingSickness.catId);
		if (!authorized) {
			return { success: false, error: error ?? 'Non autorisé', errors: {} };
		}

		await prisma.sickness.delete({
			where: { id: sicknessId }
		});

		return {
			success: true,
			message: 'Maladie supprimée avec succès',
			errors: {}
		};
	} catch (error) {
		console.error('❌ ERREUR DELETE Sickness:', error);
		return {
			success: false,
			error: 'Erreur lors de la suppression de la maladie',
			errors: {}
		};
	}
}
