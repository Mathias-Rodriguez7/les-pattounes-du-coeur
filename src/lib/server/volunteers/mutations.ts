import prisma from '#lib/server/prisma.ts';
import {
	createVolunteerSchema,
	updateVolunteerSchema,
	type CreateVolunteerInput,
	type UpdateVolunteerInput
} from '#lib/schemas/volunteer.ts';
import { inviteToJoin } from '#lib/server/invitations/mutations.ts';
import { isEmailBlacklisted } from '../accountStatus';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';

const PROFIL_FIELDS = [
	'firstName',
	'lastName',
	'birthDate',
	'email',
	'phone',
	'address',
	'city',
	'postalCode',
	'district'
] as const;

const VOLUNTEER_FIELDS = ['role', 'actif', 'breakStart', 'breakEnd'] as const;

function convertFormData(formData: FormData): Record<string, string | null> {
	const data: Record<string, string | null> = {};

	for (const [key, value] of formData.entries()) {
		data[key] = (value as string) || null;
	}

	return data;
}

async function checkEmailUniqueness(email: string, excludeProfilId?: string): Promise<boolean> {
	const existing = await prisma.profil.findUnique({ where: { email } });
	return existing !== null && existing.id !== excludeProfilId;
}

async function checkPhoneUniqueness(phone: string, excludeProfilId?: string): Promise<boolean> {
	const existing = await prisma.profil.findUnique({ where: { phone } });
	return existing !== null && existing.id !== excludeProfilId;
}

// Compare deux valeurs, en gérant le cas particulier des dates
function isSameValue(a: unknown, b: unknown): boolean {
	if (a instanceof Date && b instanceof Date) {
		return a.getTime() === b.getTime();
	}
	return a === b;
}

// ✅ Helper pour construire les données du Host
function buildVolunteerData(data: CreateVolunteerInput | UpdateVolunteerInput) {
	return VOLUNTEER_FIELDS.reduce(
		(acc, field) => {
			if (field in data && data[field as keyof typeof data] !== undefined) {
				acc[field] = data[field as keyof typeof data];
			}
			return acc;
		},
		{} as Record<string, unknown>
	);
}

// ✅ Helper pour construire les données du Profil
function buildProfilData(data: CreateVolunteerInput | UpdateVolunteerInput) {
	return PROFIL_FIELDS.reduce(
		(acc, field) => {
			if (field in data && data[field as keyof typeof data] !== undefined) {
				acc[field] = data[field as keyof typeof data];
			}
			return acc;
		},
		{} as Record<string, unknown>
	);
}

export async function createVolunteer({
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!hasAdminRole(locals.user)) {
		return {
			success: false,
			error: 'Non autorisé',
			errors: {}
		};
	}

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		// Valider les données
		const result = createVolunteerSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: zodFieldErrors(result.error)
			};
		}

		const validatedData: CreateVolunteerInput = result.data;

		if (await isEmailBlacklisted(validatedData.email)) {
			return {
				success: false,
				error: 'Cette personne est blacklistée',
				errors: { email: ['Email présent dans la blacklist'] }
			};
		}

		const existingProfil = await prisma.profil.findUnique({
			where: { email: validatedData.email },
			include: { volunteer: true }
		});

		if (existingProfil?.volunteer) {
			return {
				success: false,
				error: 'Cet email est déjà utilisé par un bénévole',
				errors: { email: ['Email déjà utilisé par un bénévole'] }
			};
		}

		// Le téléphone doit appartenir au même profil s'il existe déjà, sinon être libre
		const phoneTaken = await checkPhoneUniqueness(validatedData.phone, existingProfil?.id);
		if (phoneTaken) {
			return {
				success: false,
				error: 'Ce numéro de téléphone est déjà utilisé',
				errors: { phone: ['Téléphone déjà utilisé'] }
			};
		}

		// Rien n'est créé maintenant : une invitation part par email. Le compte sera créé
		// quand elle aura accepté le Manuel et choisi son mot de passe (acceptInvitation)
		return await inviteToJoin({
			kind: 'VOLUNTEER',
			data,
			email: validatedData.email,
			firstName: validatedData.firstName,
			formId: data.formId,
			createdById: locals.user?.id ?? null,
			origin: new URL(request.url).origin
		});
	} catch (error) {
		console.error('Erreur création Bénévole:', error);
		return {
			success: false,
			error: 'Erreur lors de la création',
			errors: {}
		};
	}
}

export async function updateVolunteer({
	formData,
	locals,
	contactEditable = false
}: {
	formData: FormData;
	locals: App.Locals;
	/**
	 * Téléphone et email : modifiables seulement depuis la page Profil (par la bénévole
	 * elle-même). Depuis la page Bénévoles, ils sont ignorés même s'ils sont envoyés.
	 */
	contactEditable?: boolean;
}) {
	if (!locals.user) {
		return {
			success: false,
			error: 'Non autorisé',
			errors: {}
		};
	}

	try {
		const data = convertFormData(formData);
		if (!contactEditable) {
			delete data.email;
			delete data.phone;
		}

		const volunteerId = data.volunteerId as string;

		if (!volunteerId) {
			return {
				success: false,
				error: 'ID du bénévole manquant',
				errors: {}
			};
		}

		// ✅ Vérifier que c'est un ADMIN ou le bénévole lui-même
		const isAdmin = hasAdminRole(locals.user);
		const isOwnProfile = locals.user.id === volunteerId;

		if (!isAdmin && !isOwnProfile) {
			return {
				success: false,
				error: 'Non autorisé',
				errors: {}
			};
		}

		// Valider les données
		const result = updateVolunteerSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: zodFieldErrors(result.error)
			};
		}

		const validatedData: UpdateVolunteerInput = result.data;

		const existingVolunteer = await prisma.volunteer.findUnique({
			where: { id: volunteerId },
			include: { profil: true }
		});

		if (!existingVolunteer) {
			return {
				success: false,
				error: 'Bénévole non trouvé',
				errors: {}
			};
		}

		if (!isAdmin && validatedData.role && validatedData.role !== existingVolunteer.role) {
			return {
				success: false,
				error: 'Non autorisé à modifier le rôle',
				errors: {}
			};
		}

		// Seul un ADMIN peut modifier les champs de VOLUNTEER_FIELDS
		if (!isAdmin) {
			for (const field of VOLUNTEER_FIELDS) {
				const newValue = validatedData[field];
				const currentValue = existingVolunteer[field];

				if (newValue !== undefined && !isSameValue(newValue, currentValue)) {
					return {
						success: false,
						error: `Non autorisé à modifier : ${field}`,
						errors: {}
					};
				}
			}
			if (
				validatedData.email !== undefined &&
				validatedData.email !== existingVolunteer.profil.email
			) {
				return {
					success: false,
					error: "Utilisez le formulaire dédié pour modifier l'email",
					errors: {}
				};
			}
		}

		const emailChanged =
			validatedData.email && validatedData.email !== existingVolunteer.profil.email;
		const phoneChanged =
			validatedData.phone && validatedData.phone !== existingVolunteer.profil.phone;

		if (emailChanged || phoneChanged) {
			const profilId = existingVolunteer.profil.id;

			const [emailExists, phoneExists] = await Promise.all([
				emailChanged
					? checkEmailUniqueness(validatedData.email!, profilId)
					: Promise.resolve(false),
				phoneChanged ? checkPhoneUniqueness(validatedData.phone!, profilId) : Promise.resolve(false)
			]);

			if (emailExists) {
				return {
					success: false,
					error: 'Cet email est déjà utilisé',
					errors: { email: ['Email déjà utilisé'] }
				};
			}

			if (phoneExists) {
				return {
					success: false,
					error: 'Ce numéro de téléphone est déjà utilisé',
					errors: { phone: ['Téléphone déjà utilisé'] }
				};
			}
		}

		const volunteerData = buildVolunteerData(validatedData);
		const profilData = buildProfilData(validatedData);

		const updatedVolunteer = await prisma.volunteer.update({
			where: { id: volunteerId },
			data: {
				...volunteerData,
				...(Object.keys(profilData).length > 0 && {
					profil: { update: profilData }
				})
			},
			include: { profil: true },
			omit: { password: true, resetToken: true, resetTokenExpiresAt: true }
		});

		return {
			success: true,
			message: 'Bénévole mis à jour avec succès',
			data: updatedVolunteer
		};
	} catch (error) {
		console.error('❌ ERREUR UPDATE:', error);
		return {
			success: false,
			error: 'Erreur lors de la mise à jour du bénévole',
			errors: {}
		};
	}
}
