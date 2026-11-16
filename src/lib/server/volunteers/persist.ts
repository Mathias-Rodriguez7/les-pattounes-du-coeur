import type { Prisma } from '@prisma/client';
import type { CreateVolunteerInput } from '#lib/schemas/volunteer.ts';
import { SignupError } from '#lib/server/invitations/errors.ts';

/**
 * Crée VRAIMENT la bénévole (appelé quand elle accepte le Manuel, dans une transaction),
 * avec le mot de passe qu'elle vient de choisir (déjà haché).
 * Personne déjà connue (FA, adoptante…) : le compte est rattaché à SON profil.
 */
export async function persistVolunteer(
	tx: Prisma.TransactionClient,
	data: CreateVolunteerInput,
	hashedPassword: string
) {
	const existingProfil = await tx.profil.findUnique({
		where: { email: data.email },
		include: { volunteer: true }
	});
	if (existingProfil?.volunteer) {
		throw new SignupError('Vous avez déjà un compte bénévole : connectez-vous.');
	}

	const phoneOwner = await tx.profil.findUnique({ where: { phone: data.phone } });
	if (phoneOwner && phoneOwner.id !== existingProfil?.id) {
		throw new SignupError("Ce numéro de téléphone est déjà utilisé : contactez l'association.");
	}

	return tx.volunteer.create({
		data: {
			role: data.role,
			actif: data.actif,
			breakStart: data.breakStart,
			breakEnd: data.breakEnd,
			password: hashedPassword,
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
		},
		select: { id: true, profilId: true }
	});
}
