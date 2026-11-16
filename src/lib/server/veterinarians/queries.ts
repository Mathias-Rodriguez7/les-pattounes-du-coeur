import prisma from '#lib/server/prisma.ts';

/** Ce qu'il faut pour la liste « Vétérinaire » d'un soin : les vétérinaires encore proposés */
export async function activeVeterinarianOptions() {
	return prisma.veterinarian.findMany({
		where: { isActive: true },
		orderBy: [{ category: 'asc' }, { name: 'asc' }],
		select: { id: true, name: true, area: true, category: true, specialty: true }
	});
}

export type VeterinarianOption = Awaited<ReturnType<typeof activeVeterinarianOptions>>[number];

/** La page Vétérinaires : tout, avec le nombre de soins (un vétérinaire utilisé ne se supprime pas) */
export async function allVeterinarians() {
	return prisma.veterinarian.findMany({
		orderBy: [{ category: 'asc' }, { name: 'asc' }],
		include: { _count: { select: { cares: true } } }
	});
}

export type VeterinarianRow = Awaited<ReturnType<typeof allVeterinarians>>[number];
