import type { ColabActivity } from '@prisma/client';
import prisma from '$lib/server/prisma';
import type { BlacklistInfo } from '$lib/types/form';

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
	// Le client, ou une transaction (tx) : on n'utilise que blacklistHistoric
	db: Pick<typeof prisma, 'blacklistHistoric'> = prisma
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

/**
 * Les entrées actives de la liste noire pour plusieurs emails, en UNE requête.
 * Renvoie une Map indexée par email en minuscules (la comparaison ignore la casse).
 * Sert aux listes de demandes : afficher la raison à côté de chaque demande concernée.
 */
export async function findActiveBlacklists(emails: string[]): Promise<Map<string, BlacklistInfo>> {
	const unique = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
	const result = new Map<string, BlacklistInfo>();
	if (unique.length === 0) return result;

	const entries = await prisma.blacklistHistoric.findMany({
		where: {
			isBlacklisted: true,
			// `in` ne sait pas ignorer la casse : un OR de « equals insensible »
			OR: unique.map((email) => ({ email: { equals: email, mode: 'insensitive' as const } }))
		},
		orderBy: { createdAt: 'desc' },
		select: { email: true, description: true, createdAt: true }
	});

	for (const entry of entries) {
		const key = entry.email.trim().toLowerCase();
		// La plus récente gagne (tri décroissant)
		if (!result.has(key)) result.set(key, { reason: entry.description, since: entry.createdAt });
	}
	return result;
}

/** Ajoute `blacklist` (ou null) à une demande, à partir d'une Map déjà chargée */
export function attachBlacklist<T extends { email: string }>(
	form: T,
	blacklists: Map<string, BlacklistInfo>
): T & { blacklist: BlacklistInfo | null } {
	return { ...form, blacklist: blacklists.get(form.email.trim().toLowerCase()) ?? null };
}

/** Ajoute `blacklist` (ou null) à chaque demande d'une liste, en une seule requête */
export async function withBlacklist<T extends { email: string }>(
	forms: T[]
): Promise<(T & { blacklist: BlacklistInfo | null })[]> {
	const blacklists = await findActiveBlacklists(forms.map((f) => f.email));
	return forms.map((form) => attachBlacklist(form, blacklists));
}
