import type { ColabActivity } from '@prisma/client';
import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';

// À utiliser dans un `include` Prisma : récupère au plus 1 blacklist active
export const activeBlacklists = {
	where: { isBlacklisted: true },
	select: { id: true },
	take: 1
};

type VolunteerStatus = {
	actif: ColabActivity | null;
	profil: { blacklists: { id: string }[] };
};

/** Un compte est désactivé s'il est en STOP ou s'il a une blacklist active */
export function isAccountDisabled(volunteer: VolunteerStatus): boolean {
	return volunteer.actif === 'STOP' || volunteer.profil.blacklists.length > 0;
}

/**
 * Vérifie si un email a une blacklist active.
 * `db` permet de l'appeler aussi à l'intérieur d'une transaction (tx).
 */
export async function isEmailBlacklisted(
	email: string,
	db: Prisma.TransactionClient = prisma
): Promise<boolean> {
	const entry = await db.blacklistHistoric.findFirst({
		where: {
			email: { equals: email.trim(), mode: 'insensitive' },
			isBlacklisted: true
		},
		select: { id: true }
	});
	return entry !== null;
}
