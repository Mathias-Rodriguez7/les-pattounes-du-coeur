import prisma from '#lib/server/prisma.ts';
import { FormType } from '@prisma/client';
import {
	updateAdoptionFormSchema,
	type UpdateAdoptionFormInput
} from '#lib/schemas/formShema/adoptionForm.ts';
import {
	updateVolunteerSchema,
	type UpdateVolunteerInput
} from '#lib/schemas/formShema/volunteerForm.ts';
import { updateHostSchema, type UpdateHostInput } from '#lib/schemas/formShema/hostForm.ts';
import { updateColabSchema, type UpdateColabInput } from '#lib/schemas/formShema/colabForm.ts';
import { canManageForm } from '#lib/server/permissions/form.ts';
import { z } from 'zod';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { applyHostRules } from '#lib/hosts/rules.ts';
import { applyVolunteerRules } from '#lib/volunteers/rules.ts';

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

		// ✅ VÉRIFICATION D'AUTORISATION : admin, bénévole assignée, ou bénévole du chat
		const isAdmin = hasAdminRole(locals.user);
		if (!(await canManageForm(locals.user, existingForm))) {
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
			console.error('❌ ERREUR VALIDATION:', zodFieldErrors(result.error));
			return {
				success: false,
				error: 'Erreur de validation',
				errors: zodFieldErrors(result.error) as Record<string, string[]>
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

		// ✅ TOUT LE MONDE PEUT MODIFIER email ET notes
		if ('email' in validatedData && validatedData.email !== undefined) {
			updateData.email = validatedData.email;
		}
		if ('notes' in validatedData && validatedData.notes !== undefined) {
			updateData.notes = validatedData.notes;
		}

		// ✅ Extraire les données spécifiques au formulaire (data JSON)
		const dataFields: Record<string, unknown> = {};
		const reservedFields = ['formId', 'status', 'email', 'notes', 'assignedToId', 'catId'];

		Object.entries(validatedData).forEach(([key, value]) => {
			if (!reservedFields.includes(key) && value !== undefined) {
				dataFields[key] = value;
			}
		});

		// Fusionner avec les données existantes (voir hosts/rules.ts et volunteers/rules.ts)
		if (Object.keys(dataFields).length > 0) {
			// Les règles du bon type de demande (une case décochée efface ce qui en dépend)
			const applyRules =
				existingForm.type === 'HOST'
					? applyHostRules
					: existingForm.type === 'VOLUNTEER'
						? applyVolunteerRules
						: <T>(data: T) => data;
			updateData.data = {
				...((existingForm.data as Record<string, unknown>) ?? {}),
				...applyRules(dataFields)
			};
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

	const formData = await request.formData();
	const formId = formData.get('formId')?.toString();
	const volunteerIdRaw = formData.get('volunteerId')?.toString();
	const volunteerId = volunteerIdRaw ? volunteerIdRaw : null;

	// Un id mal formé ferait planter PostgreSQL (colonne uuid)
	if (!formId || !z.string().uuid().safeParse(formId).success) {
		return { success: false, error: 'Formulaire manquant' };
	}
	if (volunteerId && !z.string().uuid().safeParse(volunteerId).success) {
		return { success: false, error: 'Bénévole invalide' };
	}

	// Admin : toutes les demandes. Répartitrice : seulement les demandes LIBRES
	const [currentVolunteer, form] = await Promise.all([
		prisma.volunteer.findUnique({
			where: { id: locals.user.id },
			select: { role: true, isFlexibleDispatcher: true }
		}),
		prisma.form.findUnique({ where: { id: formId }, select: { type: true } })
	]);

	if (!form) {
		return { success: false, error: 'Formulaire introuvable' };
	}

	const isAdmin = hasAdminRole(currentVolunteer);
	const isDispatcherOfThisForm =
		currentVolunteer?.isFlexibleDispatcher === true && form.type === 'ADOPTION_FLEXIBLE';

	if (!isAdmin && !isDispatcherOfThisForm) {
		return { success: false, error: "Vous n'êtes pas autorisée à assigner cette demande" };
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

	const updatedForm = await prisma.form.update({
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

	return { success: true, form: updatedForm, message: 'Bénévole assigné avec succès' };
}

export async function setFlexibleDispatcher({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	// Seuls les ADMIN peuvent désigner le dispatcher
	if (!hasAdminRole(locals.user)) {
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

// ==========================================
// REFUSER une demande d'adoption (avec la raison)
// Ouvert à toute personne qui peut traiter la demande (pas seulement l'admin) :
// la bénévole du chat doit pouvoir dire non, en expliquant pourquoi.
// ==========================================
const rejectFormSchema = z.object({
	formId: z.uuid('Demande invalide'),
	reason: z.string().trim().min(1, 'Indiquez la raison du refus').max(500, '500 caractères maximum')
});

export async function rejectForm({ request, locals }: { request: Request; locals: App.Locals }) {
	if (!locals.user) return { success: false, error: 'Non authentifié' };

	const parsed = rejectFormSchema.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) {
		return {
			success: false,
			error: 'Erreur de validation',
			errors: zodFieldErrors(parsed.error)
		};
	}
	const { formId, reason } = parsed.data;

	const form = await prisma.form.findUnique({
		where: { id: formId },
		select: { type: true, status: true, notes: true, assignedToId: true, catId: true }
	});
	if (!form || !form.type.startsWith('ADOPTION')) {
		return { success: false, error: 'Demande introuvable' };
	}
	if (!(await canManageForm(locals.user, form))) {
		return { success: false, error: "Vous n'êtes pas autorisée à traiter cette demande" };
	}
	// Une demande acceptée l'a été par une adoption : on ne la refuse pas après coup
	if (form.status !== 'PENDING') {
		return { success: false, error: 'Cette demande a déjà été traitée' };
	}

	// La raison s'AJOUTE aux notes existantes, datée
	const today = new Date().toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
	await prisma.form.update({
		where: { id: formId },
		data: {
			status: 'REJECTED',
			notes: [form.notes, `Refusée le ${today} : ${reason}`].filter(Boolean).join('\n')
		}
	});

	return { success: true, message: 'Demande refusée' };
}
