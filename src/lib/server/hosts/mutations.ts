// mutations.ts
import prisma from '$lib/server/prisma';
import {
	createHostSchema,
	updateHostSchema,
	type CreateHostInput,
	type UpdateHostInput
} from '../../schemas/host';

// ✅ Constantes pour éviter la duplication
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

const HOST_FIELDS = [
	'type',
	'actif',
	'isAvailable',
	'space',
	'homeDescription',
	'presence',
	'outside',
	'outsideDescription',
	'isStockFeed',
	'car',
	'additionalInformation',
	'hasAnimalsAtHome',
	'numberOfCatsAtHome',
	'numberOfDogsAtHome',
	'catAdult',
	'kittyAndKitten',
	'kitten',
	'otherAnimalsAtHome',
	'heal',
	'socialize',
	'babyFeeding',
	'stopActivity'
] as const;

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

// ✅ Helper pour construire les données du Host
function buildHostData(data: CreateHostInput | UpdateHostInput) {
	return HOST_FIELDS.reduce(
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
function buildProfilData(data: CreateHostInput | UpdateHostInput) {
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

export async function createHost({ request, locals }: { request: Request; locals: App.Locals }) {
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
		const result = createHostSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: result.error.flatten().fieldErrors
			};
		}

		const validatedData: CreateHostInput = result.data;

		// 🔍 Vérifier l'email
		const existingProfil = await prisma.profil.findUnique({
			where: { email: validatedData.email },
			include: { host: true }
		});

		if (existingProfil?.host) {
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

		// ✅ Créer le Host avec TOUS les champs
		const newHost = await prisma.host.create({
			data: {
				// Champs du Host
				type: validatedData.type,
				actif: validatedData.actif,
				isAvailable: validatedData.isAvailable,
				space: validatedData.space,
				homeDescription: validatedData.homeDescription,
				presence: validatedData.presence,
				outside: validatedData.outside,
				outsideDescription: validatedData.outsideDescription,
				isStockFeed: validatedData.isStockFeed,
				car: validatedData.car,
				additionalInformation: validatedData.additionalInformation,
				hasAnimalsAtHome: validatedData.hasAnimalsAtHome,
				numberOfCatsAtHome: validatedData.numberOfCatsAtHome,
				numberOfDogsAtHome: validatedData.numberOfDogsAtHome,
				catAdult: validatedData.catAdult,
				kittyAndKitten: validatedData.kittyAndKitten,
				kitten: validatedData.kitten,
				otherAnimalsAtHome: validatedData.otherAnimalsAtHome,
				heal: validatedData.heal,
				socialize: validatedData.socialize,
				babyFeeding: validatedData.babyFeeding,
				stopActivity: validatedData.stopActivity,

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
			message: "Famille d'accueil créée avec succès",
			data: newHost,
			errors: {}
		};
	} catch (error) {
		console.error('Erreur création Host:', error);
		return {
			success: false,
			error: 'Erreur lors de la création',
			errors: {}
		};
	}
}

export async function updateHost({ request, locals }: { request: Request; locals: App.Locals }) {
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

		const hostId = data.hostId as string;

		if (!hostId) {
			return {
				success: false,
				error: "ID de la famille d'accueil manquant",
				errors: {}
			};
		}

		const result = updateHostSchema.safeParse({ ...data, hostId });

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: result.error.flatten().fieldErrors
			};
		}

		const validatedData: UpdateHostInput = result.data;

		const existingHost = await prisma.host.findUnique({
			where: { id: hostId },
			include: { profil: true }
		});

		if (!existingHost) {
			return {
				success: false,
				error: "Famille d'accueil non trouvée",
				errors: {}
			};
		}

		// ✅ Vérifications d'unicité seulement si modifiés
		const emailChanged = validatedData.email && validatedData.email !== existingHost.profil.email;
		const phoneChanged = validatedData.phone && validatedData.phone !== existingHost.profil.phone;

		if (emailChanged || phoneChanged) {
			const [emailExists, phoneExists] = await Promise.all([
				emailChanged
					? checkEmailUniqueness(validatedData.email!, existingHost.profil.id)
					: Promise.resolve(false),
				phoneChanged
					? checkPhoneUniqueness(validatedData.phone!, existingHost.profil.id)
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

		const hostData = buildHostData(validatedData);
		const profilData = buildProfilData(validatedData);

		const updatedHost = await prisma.host.update({
			where: { id: hostId },
			data: {
				...hostData,
				...(Object.keys(profilData).length > 0 && {
					profil: { update: profilData }
				})
			},
			include: { profil: true }
		});

		return {
			success: true,
			message: "Famille d'accueil mise à jour avec succès",
			data: updatedHost
		};
	} catch (error) {
		console.error('❌ ERREUR UPDATE:', error);
		return {
			success: false,
			error: "Erreur lors de la mise à jour de la famille d'accueil",
			errors: {}
		};
	}
}
