import prisma from '#lib/server/prisma.ts';
import { statusWithBreak } from '#lib/volunteers/breaks.ts';

// La bénévole gère SA pause depuis son Profil (l'id vient toujours de la session).
// L'admin, elle, continue de passer par la page Bénévoles.

export async function setOwnBreak(
	volunteerId: string,
	{ breakStart, breakEnd }: { breakStart: Date; breakEnd: Date }
) {
	const volunteer = await prisma.volunteer.findUnique({
		where: { id: volunteerId },
		select: { actif: true }
	});
	if (!volunteer) return { success: false as const, error: 'Bénévole introuvable' };
	if (volunteer.actif === 'STOP') {
		return {
			success: false as const,
			error: "Votre activité est arrêtée : contactez l'association"
		};
	}

	const actif = statusWithBreak(volunteer.actif, breakStart);
	await prisma.volunteer.update({
		where: { id: volunteerId },
		data: { breakStart, breakEnd, actif }
	});
	return { success: true as const, startsNow: actif === 'BREAK' };
}

/** Annuler une pause prévue, ou reprendre avant la fin : retour à « Actif », dates effacées */
export async function cancelOwnBreak(volunteerId: string) {
	// Une bénévole arrêtée ne se réactive pas toute seule. (`actif: null` à part : en SQL,
	// NULL n'est ni égal ni différent de 'STOP', `not: 'STOP'` l'exclurait)
	const { count } = await prisma.volunteer.updateMany({
		where: { id: volunteerId, OR: [{ actif: null }, { actif: { not: 'STOP' } }] },
		data: { actif: 'ACTIVE', breakStart: null, breakEnd: null }
	});
	return count === 1
		? { success: true as const }
		: { success: false as const, error: 'Impossible de modifier votre pause' };
}
