// mutations.ts
import prisma from '#lib/server/prisma.ts';
import {
	createHostSchema,
	updateHostSchema,
	type CreateHostInput,
	type UpdateHostInput
} from '../../schemas/host';
import { isEmailBlacklisted } from '../accountStatus';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { applyHostRules } from '#lib/hosts/rules.ts';
import { inviteToJoin } from '#lib/server/invitations/mutations.ts';

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
	'adultsAtHome',
	'childrenAtHome',
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
		const result = createHostSchema.safeParse(data);

		if (!result.success) {
			return {
				success: false,
				error: 'Erreur de validation',
				errors: zodFieldErrors(result.error)
			};
		}

		const validatedData: CreateHostInput = result.data;

		if (await isEmailBlacklisted(validatedData.email)) {
			return {
				success: false,
				error: 'Cette personne est blacklistée',
				errors: { email: ['Email présent dans la blacklist'] }
			};
		}

		// 🔍 Vérifier l'email
		const existingProfil = await prisma.profil.findUnique({
			where: { email: validatedData.email },
			include: { host: true }
		});

		if (existingProfil?.host) {
			return {
				success: false,
				error: "Cette personne est déjà famille d'accueil",
				errors: { email: ["Email déjà utilisé par une famille d'accueil"] }
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

		// Rien n'est créé maintenant : une invitation part par email. La FA sera créée
		// quand elle aura accepté la Convention (acceptInvitation)
		return await inviteToJoin({
			kind: 'HOST',
			data,
			email: validatedData.email,
			firstName: validatedData.firstName,
			formId: data.formId,
			createdById: locals.user?.id ?? null,
			origin: new URL(request.url).origin
		});
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
				errors: zodFieldErrors(result.error)
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

		// Décocher « Animaux au domicile » ou « Extérieur » efface aussi ce qui en dépend (voir hosts/rules.ts)
		const hostData = buildHostData(applyHostRules(validatedData));
		const profilData = buildProfilData(validatedData);

		// Disponibilité : on retient depuis quand elle ne l'est plus (tâche F5 au bout de 3 mois)
		const availabilityChange =
			validatedData.isAvailable === undefined ||
			validatedData.isAvailable === existingHost.isAvailable
				? {}
				: { unavailableSince: validatedData.isAvailable ? null : new Date() };

		const updatedHost = await prisma.host.update({
			where: { id: hostId },
			data: {
				...hostData,
				...availabilityChange,
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
