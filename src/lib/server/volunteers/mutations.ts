import prisma from '$lib/server/prisma';
import {
	createVolunteerSchema,
	updateVolunteerSchema,
	type CreateVolunteerInput,
	type UpdateVolunteerInput
} from '$lib/schemas/volunteer';

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

async function checkEmailUniqueness(email: string, excludeId?: string): Promise<boolean> {
	const existing = await prisma.host.findFirst({
		where: {
			profil: { email }
		}
	});
	return existing ? excludeId !== existing.id : false;
}

async function checkPhoneUniqueness(phone: string, excludeId?: string): Promise<boolean> {
	const existing = await prisma.host.findFirst({
		where: {
			profil: { phone }
		}
	});
	return existing ? excludeId !== existing.id : false;
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
	if (!locals.user || locals.user.role !== 'ADMIN') {
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
				errors: result.error.flatten().fieldErrors
			};
		}

		const validatedData: CreateVolunteerInput = result.data;

		// 🔍 Vérifier l'email
		const emailExists = await checkEmailUniqueness(validatedData.email);
		if (emailExists) {
			return {
				success: false,
				error: 'Cet email est déjà utilisé',
				errors: { email: ['Email déjà utilisé'] }
			};
		}

		// 🔍 Vérifier le téléphone
		const phoneExists = await checkPhoneUniqueness(validatedData.phone);
		if (phoneExists) {
			return {
				success: false,
				error: 'Cet téléphone est déjà utilisé',
				errors: { phone: ['Téléphone déjà utilisé'] }
			};
		}

		const newVolunteer = await prisma.volunteer.create({
			data: {
				role: validatedData.role,
				actif: validatedData.actif,
				breakStart: validatedData.breakStart,
				breakEnd: validatedData.breakEnd,

				// Créer le profil associé
				profil: {
					create: {
						firstName: validatedData.firstName,
						lastName: validatedData.lastName,
						birthDate: validatedData.birthDate,
						email: validatedData.email,
						phone: validatedData.phone,
						address: validatedData.address,
						city: validatedData.city,
						postalCode: validatedData.postalCode,
						district: validatedData.district
					}
				}
			},
			include: { profil: true }
		});

		return {
			success: true,
			message: 'Bénévole créé avec succès',
			data: newVolunteer,
			errors: {}
		};
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
	request,
	locals
}: {
	request: Request;
	locals: App.Locals;
}) {
	if (!locals.user) {
		return {
			success: false,
			error: 'Non autorisé',
			errors: {}
		};
	}

	try {
		const formData = await request.formData();
		const data = convertFormData(formData);

		const volunteerId = data.volunteerId as string;

		if (!volunteerId) {
			return {
				success: false,
				error: 'ID du bénévole manquant',
				errors: {}
			};
		}

		// ✅ Vérifier que c'est un ADMIN ou le bénévole lui-même
		const isAdmin = locals.user.role === 'ADMIN';
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
				errors: result.error.flatten().fieldErrors
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

		const emailChanged =
			validatedData.email && validatedData.email !== existingVolunteer.profil.email;
		const phoneChanged =
			validatedData.phone && validatedData.phone !== existingVolunteer.profil.phone;

		if (emailChanged || phoneChanged) {
			const [emailExists, phoneExists] = await Promise.all([
				emailChanged
					? checkEmailUniqueness(validatedData.email!, volunteerId)
					: Promise.resolve(false),
				phoneChanged
					? checkPhoneUniqueness(validatedData.phone!, volunteerId)
					: Promise.resolve(false)
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
			include: { profil: true }
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
