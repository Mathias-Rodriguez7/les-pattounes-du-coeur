import prisma from '#lib/server/prisma.ts';
import type { AppUser } from '#lib/types/user.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';

/**
 * ADMIN : tous les chats. Les autres : seulement les chats auxquels ils sont associés
 * (et pour une COMMUNICATION, ceux dont la publication est demandée).
 * Renvoie aussi false si le chat n'existe pas.
 */
export async function canManageCat(user: AppUser, catId: string): Promise<boolean> {
	if (hasAdminRole(user)) {
		return (await prisma.cat.count({ where: { id: catId } })) > 0;
	}

	// Une bénévole COMMUNICATION : aussi les chats dont la publication est demandée
	// (elle peut les modifier avant de valider)
	if (user.role === 'COMMUNICATION') {
		const requested = await prisma.cat.count({
			where: { id: catId, publicationRequestedAt: { not: null } }
		});
		if (requested > 0) return true;
	}

	const link = await prisma.catVolunteer.findFirst({
		where: { catId, volunteerId: user.id },
		select: { catId: true }
	});
	return link !== null;
}

/** Un placement se gère avec les mêmes droits que son chat */
export async function canManagePlacement(user: AppUser, placementId: string): Promise<boolean> {
	const placement = await prisma.placement.findUnique({
		where: { id: placementId },
		select: { catId: true }
	});
	return placement !== null && canManageCat(user, placement.catId);
}
