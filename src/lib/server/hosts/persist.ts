import type { Prisma } from '@prisma/client';
import type { CreateHostInput } from '#lib/schemas/host.ts';
import { SignupError } from '#lib/server/invitations/errors.ts';

/**
 * Crée VRAIMENT la FA (appelé quand elle accepte la Convention, dans une transaction).
 * Personne déjà connue (bénévole, adoptante…) : la FA est rattachée à SON profil.
 * Les vérifications sont refaites ici : entre l'invitation et l'acceptation, la situation
 * a pu changer (une autre FA créée avec cet email, ce téléphone…).
 */
export async function persistHost(tx: Prisma.TransactionClient, data: CreateHostInput) {
	const existingProfil = await tx.profil.findUnique({
		where: { email: data.email },
		include: { host: true }
	});
	if (existingProfil?.host) {
		throw new SignupError("Vous êtes déjà famille d'accueil : rien à faire de plus !");
	}

	const phoneOwner = await tx.profil.findUnique({ where: { phone: data.phone } });
	if (phoneOwner && phoneOwner.id !== existingProfil?.id) {
		throw new SignupError("Ce numéro de téléphone est déjà utilisé : contactez l'association.");
	}

	return tx.host.create({
		data: {
			type: data.type,
			actif: data.actif,
			isAvailable: data.isAvailable,
			unavailableSince: data.isAvailable ? null : new Date(),
			space: data.space,
			homeDescription: data.homeDescription,
			presence: data.presence,
			outside: data.outside,
			outsideDescription: data.outsideDescription,
			isStockFeed: data.isStockFeed,
			car: data.car,
			additionalInformation: data.additionalInformation,
			hasAnimalsAtHome: data.hasAnimalsAtHome,
			numberOfCatsAtHome: data.numberOfCatsAtHome,
			numberOfDogsAtHome: data.numberOfDogsAtHome,
			catAdult: data.catAdult,
			kittyAndKitten: data.kittyAndKitten,
			kitten: data.kitten,
			otherAnimalsAtHome: data.otherAnimalsAtHome,
			adultsAtHome: data.adultsAtHome,
			childrenAtHome: data.childrenAtHome,
			heal: data.heal,
			socialize: data.socialize,
			babyFeeding: data.babyFeeding,
			stopActivity: data.stopActivity,
			profil: existingProfil
				? { connect: { id: existingProfil.id } }
				: {
						create: {
							firstName: data.firstName,
							lastName: data.lastName,
							birthDate: data.birthDate,
							email: data.email,
							phone: data.phone,
							address: data.address,
							city: data.city,
							postalCode: data.postalCode,
							district: data.district
						}
					}
		}
	});
}
