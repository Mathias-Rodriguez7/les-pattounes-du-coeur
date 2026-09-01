import prisma from '$lib/server/prisma';
import { z } from 'zod';
import { createHostSchema, updateHostSchema } from './schemas';

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
		const data = Object.fromEntries(formData);

		// 🔄 Conversion des types
		const convertedData = {
			...data,
			age: data.age ? parseInt(data.age as string) : undefined,
			numberOfCatsAtHome: data.numberOfCatsAtHome
				? parseInt(data.numberOfCatsAtHome as string)
				: undefined,
			numberOfDogsAtHome: data.numberOfDogsAtHome
				? parseInt(data.numberOfDogsAtHome as string)
				: undefined,
			hasAnimalsAtHome: data.hasAnimalsAtHome === 'on' || data.hasAnimalsAtHome === 'true',
			outside: data.outside === 'on' || data.outside === 'true',
			isStockFeed: data.isStockFeed === 'on' || data.isStockFeed === 'true',
			car: data.car === 'on' || data.car === 'true'
		};

		// ✅ Validation du schéma
		const validatedData = createHostSchema.parse(convertedData);

		// 🔍 Vérifier si l'email existe déjà
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

		// 🔍 Vérifier si le téléphone existe déjà
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

		// 📊 Créer le profil et l'hôte ensemble
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
				age: validatedData.age,
				type: validatedData.type || null,
				job: validatedData.job,
				status: validatedData.status,
				actif: validatedData.actif,
				additionalInformation: validatedData.additionalInformation || '',
				hasAnimalsAtHome: validatedData.hasAnimalsAtHome,
				numberOfCatsAtHome: validatedData.numberOfCatsAtHome || null,
				numberOfDogsAtHome: validatedData.numberOfDogsAtHome || null,
				otherAnimalsAtHome: validatedData.otherAnimalsAtHome || null,
				space: validatedData.space,
				homeDescription: validatedData.homeDescription,
				presence: validatedData.presence,
				outside: validatedData.outside,
				outsideDescription: validatedData.outsideDescription || null,
				isStockFeed: validatedData.isStockFeed,
				heal: validatedData.heal,
				socialize: validatedData.socialize,
				car: validatedData.car,
				babyFeeding: validatedData.babyFeeding,
				availabilityDuration: '',
				stopActivity: ''
			},
			include: {
				profil: true
			}
		});

		return {
			success: true,
			message: "Famille d'accueil créée avec succès",
			data: newHost
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = error.flatten().fieldErrors;
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
		const data = Object.fromEntries(formData);

		const hostId = data.hostId as string;

		if (!hostId) {
			return {
				success: false,
				error: "ID de la famille d'accueil manquant",
				errors: {}
			};
		}

		// 🔄 Conversion des types
		const convertedData = {
			...data,
			hostId: undefined,
			age: data.age ? parseInt(data.age as string) : undefined,
			numberOfCatsAtHome: data.numberOfCatsAtHome
				? parseInt(data.numberOfCatsAtHome as string)
				: undefined,
			numberOfDogsAtHome: data.numberOfDogsAtHome
				? parseInt(data.numberOfDogsAtHome as string)
				: undefined,
			hasAnimalsAtHome: data.hasAnimalsAtHome === 'on' || data.hasAnimalsAtHome === 'true',
			outside: data.outside === 'on' || data.outside === 'true',
			isStockFeed: data.isStockFeed === 'on' || data.isStockFeed === 'true',
			car: data.car === 'on' || data.car === 'true'
		};

		// ✅ Validation du schéma
		const validatedData = updateHostSchema.parse({ ...convertedData, hostId });

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
		if (validatedData.job !== undefined) hostUpdateData.job = validatedData.job;
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

export async function deleteHost(hostId: string) {
	try {
		// 🔍 Vérifier que la famille d'accueil existe
		const existingHost = await prisma.host.findUnique({
			where: { id: hostId },
			include: { profil: true, placements: true }
		});

		if (!existingHost) {
			return {
				success: false,
				error: "Famille d'accueil non trouvée",
				errors: {}
			};
		}

		// ⚠️ Vérifier s'il y a des placements actifs
		const activePlacements = existingHost.placements.filter((p) => !p.ended);

		if (activePlacements.length > 0) {
			return {
				success: false,
				error: `Impossible de supprimer : ${activePlacements.length} chat(s) en placement actif`,
				errors: {}
			};
		}

		// 🗑️ Supprimer les placements
		await prisma.placement.deleteMany({
			where: { hostId }
		});

		// 🗑️ Supprimer l'hôte
		await prisma.host.delete({
			where: { id: hostId }
		});

		// 🗑️ Supprimer le profil
		await prisma.profil.delete({
			where: { id: existingHost.profilId }
		});

		return {
			success: true,
			message: "Famille d'accueil supprimée avec succès"
		};
	} catch (error) {
		console.error("Erreur lors de la suppression de la famille d'accueil:", error);
		return {
			success: false,
			error: "Erreur lors de la suppression de la famille d'accueil",
			errors: {}
		};
	}
}
