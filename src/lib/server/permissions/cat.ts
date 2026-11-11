import prisma from '$lib/server/prisma';
import type { AppUser } from '$lib/types/user';

/**
 * ADMIN : tous les chats. Les autres : seulement les chats auxquels ils sont associés.
 * Renvoie aussi false si le chat n'existe pas.
 */
export async function canManageCat(user: AppUser, catId: string): Promise<boolean> {
	if (user.role === 'ADMIN') {
		return (await prisma.cat.count({ where: { id: catId } })) > 0;
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
