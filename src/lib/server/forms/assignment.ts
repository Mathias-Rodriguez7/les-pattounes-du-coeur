// src/lib/server/forms/assignment.ts
import prisma from '$lib/server/prisma';

/**
 * La bénévole « référente » d'un chat : la première associée.
 * C'est elle qui reçoit les demandes d'adoption pour ce chat. null si aucune.
 */
export async function getCatReferentId(catId: string): Promise<string | null> {
	const link = await prisma.catVolunteer.findFirst({
		where: { catId },
		orderBy: { createdAt: 'asc' },
		select: { volunteerId: true }
	});
	return link?.volunteerId ?? null;
}
