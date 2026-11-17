import prisma from '#lib/server/prisma.ts';
import type { InvitationKind } from '@prisma/client';
import { createHostSchema } from '#lib/schemas/host.ts';
import { createVolunteerSchema } from '#lib/schemas/volunteer.ts';

// Les candidatures en attente (invitations pas encore acceptées), affichées dans les listes
// des pages FA et Bénévoles. Les infos saisies par l'admin sont dans `data` (JSON).

async function findPending(kind: InvitationKind) {
	return prisma.invitation.findMany({
		where: { kind },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			email: true,
			data: true,
			createdAt: true,
			expiresAt: true,
			createdBy: { select: { profil: { select: { firstName: true, lastName: true } } } }
		}
	});
}

type PendingRow = Awaited<ReturnType<typeof findPending>>[number];

/** Ce qui est commun aux FA et aux bénévoles : qui, quand, par qui, et la personne saisie */
function toCandidate({ data, createdBy, ...invitation }: PendingRow, now: Date) {
	const person = (data ?? {}) as Record<string, string | null | undefined>;
	return {
		...invitation,
		name: [person.firstName, person.lastName].filter(Boolean).join(' ') || invitation.email,
		expired: invitation.expiresAt < now,
		createdByName: createdBy ? `${createdBy.profil.firstName} ${createdBy.profil.lastName}` : null,
		// Lu tel quel (chaînes) : les vues « Personne » l'acceptent
		person: {
			firstName: person.firstName ?? null,
			lastName: person.lastName ?? null,
			birthDate: person.birthDate ?? null,
			email: person.email ?? invitation.email,
			phone: person.phone ?? null,
			address: person.address ?? null,
			city: person.city ?? null,
			postalCode: person.postalCode ?? null,
			district: person.district ?? null
		}
	};
}

/** Les candidatures FA, avec l'accueil proposé (relu avec le schéma de création) */
export async function pendingHostInvitations() {
	const now = new Date();
	const rows = await findPending('HOST');
	return rows.map((row) => {
		// Les données ont été validées à l'envoi. Si le schéma a changé depuis : on n'affiche
		// que la personne, plutôt que de planter
		const parsed = createHostSchema.safeParse(row.data);
		return {
			...toCandidate(row, now),
			host: parsed.success
				? {
						...parsed.data,
						stopActivity: parsed.data.stopActivity ?? null,
						outsideDescription: parsed.data.outsideDescription ?? null,
						additionalInformation: parsed.data.additionalInformation ?? null,
						numberOfCatsAtHome: parsed.data.numberOfCatsAtHome ?? null,
						numberOfDogsAtHome: parsed.data.numberOfDogsAtHome ?? null,
						otherAnimalsAtHome: parsed.data.otherAnimalsAtHome ?? null,
						adultsAtHome: parsed.data.adultsAtHome ?? null,
						childrenAtHome: parsed.data.childrenAtHome ?? null
					}
				: null
		};
	});
}

/** Les candidatures bénévoles, avec le rôle prévu */
export async function pendingVolunteerInvitations() {
	const now = new Date();
	const rows = await findPending('VOLUNTEER');
	return rows.map((row) => {
		const parsed = createVolunteerSchema.safeParse(row.data);
		return { ...toCandidate(row, now), role: parsed.success ? parsed.data.role : null };
	});
}

/** Une candidature, quelle que soit sa sorte : ce que la ligne et le panneau communs utilisent */
export type PendingInvitation = ReturnType<typeof toCandidate>;
export type HostCandidate = Awaited<ReturnType<typeof pendingHostInvitations>>[number];
export type VolunteerCandidate = Awaited<ReturnType<typeof pendingVolunteerInvitations>>[number];
