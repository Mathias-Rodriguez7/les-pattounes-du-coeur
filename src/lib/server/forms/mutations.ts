import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { FormType } from '@prisma/client';
import {
	updateAdoptionFormSchema,
	type UpdateAdoptionFormInput
} from '$lib/schemas/formShema/adoptionForm';
import {
	updateVolunteerSchema,
	type UpdateVolunteerInput
} from '$lib/schemas/formShema/volunteerForm';
import { updateHostSchema, type UpdateHostInput } from '$lib/schemas/formShema/hostForm';
import { updateColabSchema, type UpdateColabInput } from '$lib/schemas/formShema/colabForm';

// 🎯 Union type (utilise les types)
type UpdateFormInput =
	UpdateAdoptionFormInput | UpdateVolunteerInput | UpdateHostInput | UpdateColabInput;

// 🔧 Map les schemas selon le type de form
const SCHEMA_MAP = {
	[FormType.ADOPTION_SPECIFIC]: updateAdoptionFormSchema,
	[FormType.ADOPTION_FLEXIBLE]: updateAdoptionFormSchema,
	[FormType.VOLUNTEER]: updateVolunteerSchema,
	[FormType.HOST]: updateHostSchema,
	[FormType.COLAB]: updateColabSchema,
	[FormType.OTHER]: updateVolunteerSchema
} as const;

function convertFormData(formData: FormData): Record<string, string | boolean | null> {
	const data: Record<string, string | boolean | null> = {};

	for (const [key, value] of formData.entries()) {
		// Gérer les checkboxes et booleans
		if (value === 'on' || value === 'true') {
			data[key] = true;
		} else if (value === 'false') {
			data[key] = false;
		} else if (value === '' || value === null) {
			data[key] = null;
		} else {
			data[key] = value as string;
		}
	}

	return data;
}

interface UpdateFormResponse {
	success: boolean;
	message?: string;
	data?: object;
	error: string;
	errors: Record<string, string[]>;
}

export async function updateForm({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}): Promise<UpdateFormResponse> {
	if (!locals.user) {
		return {
			success: false,
			error: 'Non authentifié',
			errors: {}
		};
	}

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		const formId = data.formId as string;

		if (!formId) {
			return {
				success: false,
				error: 'ID du formulaire manquant',
				errors: {}
			};
		}

		// 🔍 Récupérer le formulaire existant
		const existingForm = await prisma.form.findUnique({
			where: { id: formId }
		});

		if (!existingForm) {
			return {
				success: false,
				error: 'Formulaire non trouvé',
				errors: {}
			};
		}

		// ✅ VÉRIFICATION D'AUTORISATION
		const isAdmin = locals.user.role === 'ADMIN';
		const isAssignedToUser = existingForm.assignedToId === locals.user.id;

		if (!isAdmin && !isAssignedToUser) {
			return {
				success: false,
				error: 'Non autorisé à modifier ce formulaire',
				errors: {}
			};
		}

		// 🎯 Récupérer le bon schema selon le type
		const schema = SCHEMA_MAP[existingForm.type as FormType];

		if (!schema) {
			return {
				success: false,
				error: `Pas de schéma de validation pour le type ${existingForm.type}`,
				errors: {}
			};
		}

		// ✅ Valider les données
		const result = schema.safeParse(data);

		if (!result.success) {
			console.error('❌ ERREUR VALIDATION:', result.error.flatten());
			return {
				success: false,
				error: 'Erreur de validation',
				errors: result.error.flatten().fieldErrors as Record<string, string[]>
			};
		}

		const validatedData = result.data as UpdateFormInput;

		// 🔄 Préparer les données de mise à jour
		const updateData: Record<string, unknown> = {};

		// ⚠️ SEUL LES ADMIN PEUVENT MODIFIER status, assignedToId
		if (isAdmin) {
			if ('status' in validatedData && validatedData.status !== undefined) {
				updateData.status = validatedData.status;
			}
			if ('assignedToId' in validatedData && validatedData.assignedToId !== undefined) {
				updateData.assignedToId = validatedData.assignedToId;
			}
		}

		// ✅ TOUT LE MONDE PEUT MODIFIER notes ET data
		if ('email' in validatedData && validatedData.email !== undefined) {
			updateData.email = validatedData.email;
		}
		if ('notes' in validatedData && validatedData.notes !== undefined) {
			updateData.notes = validatedData.notes;
		}

		// ✅ Extraire les données spécifiques au formulaire (data JSON)
		const dataFields: Record<string, unknown> = {};
		const reservedFields = ['formId', 'status', 'email', 'notes', 'assignedToId'];

		Object.entries(validatedData).forEach(([key, value]) => {
			if (!reservedFields.includes(key) && value !== undefined) {
				dataFields[key] = value;
			}
		});

		// Fusionner avec les données existantes
		if (Object.keys(dataFields).length > 0) {
			const existingData = (existingForm.data as Record<string, unknown>) || {};
			updateData.data = { ...existingData, ...dataFields };
		}

		// 📝 Mettre à jour le formulaire
		const updatedForm = await prisma.form.update({
			where: { id: formId },
			data: updateData,
			include: {
				assignedTo: {
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
		});

		return {
			success: true,
			message: 'Formulaire mis à jour avec succès',
			data: updatedForm,
			error: '',
			errors: {}
		};
	} catch (error) {
		console.error('❌ ERREUR UPDATE FORM:', error);
		return {
			success: false,
			error: 'Erreur lors de la mise à jour du formulaire',
			errors: {}
		};
	}
}

export async function assignVolunteer({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return { success: false, error: 'Non autorisé' };
	}

	// Seuls les ADMIN peuvent assigner
	const currentVolunteer = await prisma.volunteer.findUnique({
		where: { id: locals.user.id },
		select: { role: true }
	});

	if (currentVolunteer?.role !== 'ADMIN') {
		return { success: false, error: 'Action réservée aux administrateurs' };
	}

	const formData = await request.formData();
	const formId = formData.get('formId')?.toString();
	const volunteerIdRaw = formData.get('volunteerId')?.toString();
	const volunteerId = volunteerIdRaw ? volunteerIdRaw : null;

	if (!formId) {
		return { success: false, error: 'Formulaire manquant' };
	}

	// Vérifier que le bénévole cible existe si on en assigne un
	if (volunteerId) {
		const exists = await prisma.volunteer.findUnique({
			where: { id: volunteerId },
			select: { id: true }
		});
		if (!exists) {
			return { success: false, error: 'Bénévole introuvable' };
		}
	}

	const form = await prisma.form.update({
		where: { id: formId },
		data: { assignedToId: volunteerId },
		include: {
			assignedTo: {
				include: {
					profil: { select: { firstName: true, lastName: true } }
				}
			}
		}
	});

	return { success: true, form };
}

export async function setFlexibleDispatcher({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return { success: false, error: 'Non autorisé' };
	}

	// Seuls les ADMIN peuvent désigner le dispatcher
	const currentVolunteer = await prisma.volunteer.findUnique({
		where: { id: locals.user.id },
		select: { role: true }
	});

	if (currentVolunteer?.role !== 'ADMIN') {
		return { success: false, error: 'Action réservée aux administrateurs' };
	}

	const formData = await request.formData();
	const volunteerId = formData.get('volunteerId')?.toString();

	if (!volunteerId) {
		return { success: false, error: 'Bénévole manquant' };
	}

	const target = await prisma.volunteer.findUnique({
		where: { id: volunteerId },
		select: { id: true }
	});

	if (!target) {
		return { success: false, error: 'Bénévole introuvable' };
	}

	// Transaction : on retire le rôle à tous les autres, puis on l'attribue à la cible
	await prisma.$transaction([
		prisma.volunteer.updateMany({
			where: { isFlexibleDispatcher: true, NOT: { id: volunteerId } },
			data: { isFlexibleDispatcher: false }
		}),
		prisma.volunteer.update({
			where: { id: volunteerId },
			data: { isFlexibleDispatcher: true }
		})
	]);

	return { success: true, message: 'Dispatcher flexible mis à jour' };
}
