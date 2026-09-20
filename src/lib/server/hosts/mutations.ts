import prisma from '$lib/server/prisma';
import { z } from 'zod';
import { createHostSchema, updateHostSchema } from './schemas';

function convertFormData(formData: FormData): Record<string, any> {
	const data: Record<string, any> = {};

	for (const [key, value] of formData.entries()) {
		const stringValue = value as string;

		// ✅ UNIQUEMENT les checkboxes
		if (stringValue === 'on' || stringValue === 'true') {
			data[key] = true;
		} else if (stringValue === 'false') {
			data[key] = false;
		}
		// ✅ Convertir les strings vides en null
		else if (stringValue === '') {
			data[key] = null;
		}
		// ✅ TOUT LE RESTE reste en string
		else {
			data[key] = stringValue;
		}
	}

	return data;
}

export async function createHost({ request, locals }: { request: Request; locals: any }) {
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

		console.log('1️⃣ APRÈS convertFormData:', data);

		// ✅ Validation du schéma - utilise safeParse pour récupérer le type correct
		const result = createHostSchema.safeParse(data);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			console.error('❌ Erreur Zod:', errors);
			return {
				success: false,
				error: 'Erreur de validation',
				errors
			};
		}

		// ✅ Maintenant validatedData a le bon type
		const validatedData = result.data; // Type: CreateHostInput (correctement typé)

		console.log('2️⃣ APRÈS Zod validation:', validatedData);

		// 🔍 Vérifier si l'email existe déjà
		const existingEmail = await prisma.profil.findUnique({
			where: { email: validatedData.email }
		});
		console.log('3️⃣ Vérif email existant:', existingEmail);

		if (existingEmail) {
			return {
				success: false,
				error: 'Cet email est déjà utilisé',
				errors: { email: ['Email déjà utilisé'] }
			};
		}

		// 🔍 Vérifier si le téléphone existe déjà
		const existingPhone = await prisma.profil.findUnique({
			where: { phone: validatedData.phone }
		});
		console.log('4️⃣ Vérif téléphone existant:', existingPhone);

		if (existingPhone) {
			return {
				success: false,
				error: 'Ce numéro de téléphone est déjà utilisé',
				errors: { phone: ['Téléphone déjà utilisé'] }
			};
		}

		// 📊 Créer le profil et l'hôte ensemble
		console.log('5️⃣ AVANT création Prisma - validatedData:', validatedData);

		const newHost = await prisma.host.create({
			data: {
				profil: {
					create: {
						firstName: validatedData.firstName,
						lastName: validatedData.lastName,
						email: validatedData.email,
						phone: validatedData.phone,
						address: validatedData.address,
						city: validatedData.city,
						postalCode: validatedData.postalCode,
						district: validatedData.district || null
					}
				},
				age: validatedData.age, // ✅ Maintenant c'est un number
				type: validatedData.type || null, // ✅ Maintenant c'est HostType | null
				status: validatedData.status, // ✅ Maintenant c'est HostStatus
				actif: 'ACTIVE',
				additionalInformation: validatedData.additionalInformation || '',
				hasAnimalsAtHome: validatedData.hasAnimalsAtHome,
				numberOfCatsAtHome: validatedData.numberOfCatsAtHome || null,
				numberOfDogsAtHome: validatedData.numberOfDogsAtHome || null,
				otherAnimalsAtHome: validatedData.otherAnimalsAtHome || null,
				space: validatedData.space, // ✅ Maintenant c'est Space
				homeDescription: validatedData.homeDescription,
				presence: validatedData.presence,
				outside: validatedData.outside,
				outsideDescription: validatedData.outsideDescription || null,
				isStockFeed: validatedData.isStockFeed,
				heal: validatedData.heal, // ✅ Maintenant c'est Heal
				socialize: validatedData.socialize, // ✅ Maintenant c'est Socialize
				car: validatedData.car,
				babyFeeding: validatedData.babyFeeding, // ✅ Maintenant c'est BabyFeeding
				availabilityDuration: validatedData.availabilityDuration,
				stopActivity: ''
			},
			include: {
				profil: true
			}
		});

		console.log('6️⃣ APRÈS création Prisma - newHost:', newHost);

		return {
			success: true,
			message: "Famille d'accueil créée avec succès",
			data: newHost
		};
	} catch (error) {
		console.error('❌ ERREUR:', error);

		if (error instanceof z.ZodError) {
			const errors = error.flatten().fieldErrors;
			console.error('❌ Erreur Zod:', errors);
			return {
				success: false,
				error: 'Erreur de validation',
				errors
			};
		}

		console.error("Erreur lors de la création de la famille d'accueil:", error);
		return {
			success: false,
			error: "Erreur lors de la création de la famille d'accueil",
			errors: {}
		};
	}
}

export async function updateHost({ request }: { request: Request }) {
	try {
		const formData = await request.formData();
		const data = convertFormData(formData); // ✅ Utilise la même conversion

		const hostId = data.hostId as string;

		if (!hostId) {
			return {
				success: false,
				error: "ID de la famille d'accueil manquant",
				errors: {}
			};
		}

		// ✅ Validation du schéma avec safeParse
		const result = updateHostSchema.safeParse({ ...data, hostId });

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return {
				success: false,
				error: 'Erreur de validation',
				errors
			};
		}

		const validatedData = result.data;

		// 🔍 Vérifier que la famille d'accueil existe
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

		// 🔍 Vérifier l'email si modifié
		if (validatedData.email && validatedData.email !== existingHost.profil.email) {
			const existingEmail = await prisma.profil.findUnique({
				where: { email: validatedData.email }
			});

			if (existingEmail) {
				return {
					success: false,
					error: 'Cet email est déjà utilisé',
					errors: { email: ['Email déjà utilisé'] }
				};
			}
		}

		// 🔍 Vérifier le téléphone si modifié
		if (validatedData.phone && validatedData.phone !== existingHost.profil.phone) {
			const existingPhone = await prisma.profil.findUnique({
				where: { phone: validatedData.phone }
			});

			if (existingPhone) {
				return {
					success: false,
					error: 'Ce numéro de téléphone est déjà utilisé',
					errors: { phone: ['Téléphone déjà utilisé'] }
				};
			}
		}

		// 📊 Préparer les données pour la mise à jour du profil
		const profilUpdateData: any = {};
		if (validatedData.firstName !== undefined) profilUpdateData.firstName = validatedData.firstName;
		if (validatedData.lastName !== undefined) profilUpdateData.lastName = validatedData.lastName;
		if (validatedData.email !== undefined) profilUpdateData.email = validatedData.email;
		if (validatedData.phone !== undefined) profilUpdateData.phone = validatedData.phone;
		if (validatedData.address !== undefined) profilUpdateData.address = validatedData.address;
		if (validatedData.city !== undefined) profilUpdateData.city = validatedData.city;
		if (validatedData.postalCode !== undefined)
			profilUpdateData.postalCode = validatedData.postalCode;
		if (validatedData.district !== undefined) profilUpdateData.district = validatedData.district;

		// 📊 Préparer les données pour la mise à jour du host
		const hostUpdateData: any = {};
		if (validatedData.age !== undefined) hostUpdateData.age = validatedData.age;
		if (validatedData.type !== undefined) hostUpdateData.type = validatedData.type;
		if (validatedData.status !== undefined) hostUpdateData.status = validatedData.status;
		if (validatedData.actif !== undefined) hostUpdateData.actif = validatedData.actif;
		if (validatedData.additionalInformation !== undefined)
			hostUpdateData.additionalInformation = validatedData.additionalInformation;
		if (validatedData.hasAnimalsAtHome !== undefined)
			hostUpdateData.hasAnimalsAtHome = validatedData.hasAnimalsAtHome;
		if (validatedData.numberOfCatsAtHome !== undefined)
			hostUpdateData.numberOfCatsAtHome = validatedData.numberOfCatsAtHome;
		if (validatedData.numberOfDogsAtHome !== undefined)
			hostUpdateData.numberOfDogsAtHome = validatedData.numberOfDogsAtHome;
		if (validatedData.otherAnimalsAtHome !== undefined)
			hostUpdateData.otherAnimalsAtHome = validatedData.otherAnimalsAtHome;
		if (validatedData.space !== undefined) hostUpdateData.space = validatedData.space;
		if (validatedData.homeDescription !== undefined)
			hostUpdateData.homeDescription = validatedData.homeDescription;
		if (validatedData.presence !== undefined) hostUpdateData.presence = validatedData.presence;
		if (validatedData.outside !== undefined) hostUpdateData.outside = validatedData.outside;
		if (validatedData.outsideDescription !== undefined)
			hostUpdateData.outsideDescription = validatedData.outsideDescription;
		if (validatedData.isStockFeed !== undefined)
			hostUpdateData.isStockFeed = validatedData.isStockFeed;
		if (validatedData.heal !== undefined) hostUpdateData.heal = validatedData.heal;
		if (validatedData.socialize !== undefined) hostUpdateData.socialize = validatedData.socialize;
		if (validatedData.car !== undefined) hostUpdateData.car = validatedData.car;
		if (validatedData.babyFeeding !== undefined)
			hostUpdateData.babyFeeding = validatedData.babyFeeding;
		if (validatedData.availabilityDuration !== undefined)
			hostUpdateData.availabilityDuration = validatedData.availabilityDuration;

		// 🔄 Mettre à jour le profil et l'hôte
		const updatedHost = await prisma.host.update({
			where: { id: hostId },
			data: {
				...hostUpdateData,
				profil: {
					update: profilUpdateData
				}
			},
			include: {
				profil: true
			}
		});

		return {
			success: true,
			message: "Famille d'accueil mise à jour avec succès",
			data: updatedHost
		};
	} catch (error) {
		console.error('❌ ERREUR UPDATE:', error);

		if (error instanceof z.ZodError) {
			const errors = error.flatten().fieldErrors;
			return {
				success: false,
				error: 'Erreur de validation',
				errors
			};
		}

		console.error("Erreur lors de la mise à jour de la famille d'accueil:", error);
		return {
			success: false,
			error: "Erreur lors de la mise à jour de la famille d'accueil",
			errors: {}
		};
	}
}
