import prisma from '#lib/server/prisma.ts';
import type { InvitationKind } from '@prisma/client';

/** Les inscriptions en attente d'acceptation, pour l'encart des pages FA et Bénévoles */
export async function pendingInvitations(kind: InvitationKind) {
	const invitations = await prisma.invitation.findMany({
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

	const now = new Date();
	return invitations.map(({ data, createdBy, ...invitation }) => {
		const { firstName, lastName } = data as { firstName?: string; lastName?: string };
		return {
			...invitation,
			name: [firstName, lastName].filter(Boolean).join(' ') || invitation.email,
			expired: invitation.expiresAt < now,
			createdByName: createdBy ? `${createdBy.profil.firstName} ${createdBy.profil.lastName}` : null
		};
	});
}

export type PendingInvitation = Awaited<ReturnType<typeof pendingInvitations>>[number];
