import prisma from '#lib/server/prisma.ts';
import type { BlacklistEntry, BlacklistPerson } from '#lib/types/blacklist.ts';
import { sameEmail } from './mutations.ts';

/** Lit un champ texte dans le JSON `data` d'une demande (son contenu dépend du type de formulaire) */
function textFrom(data: unknown, key: string): string | null {
	if (typeof data !== 'object' || data === null) return null;
	const value = (data as Record<string, unknown>)[key];
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * Les personnes ACTUELLEMENT blacklistées, avec leur historique complet.
 * 3 requêtes au total, quel que soit le nombre de personnes (pas de requête par ligne).
 */
export async function getBlacklistOverview(): Promise<{
	people: BlacklistPerson[];
	liftedCount: number;
}> {
	// 1. Toutes les lignes, regroupées par email (en minuscules)
	const rows = await prisma.blacklistHistoric.findMany({
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			email: true,
			description: true,
			isBlacklisted: true,
			createdAt: true,
			updatedAt: true
		}
	});

	const byEmail = new Map<string, BlacklistEntry[]>();
	for (const { email, ...entry } of rows) {
		const key = email.trim().toLowerCase();
		byEmail.set(key, [...(byEmail.get(key) ?? []), entry]);
	}

	const liftedCount = rows.filter((row) => !row.isBlacklisted).length;

	// On ne garde que les emails qui ont au moins une ligne active
	const activeEmails = [...byEmail.entries()]
		.filter(([, history]) => history.some((entry) => entry.isBlacklisted))
		.map(([email]) => email);

	if (activeEmails.length === 0) return { people: [], liftedCount };

	const anyOfEmails = activeEmails.map((email) => ({ email: sameEmail(email) }));

	// 2. Les comptes (bénévole / FA) et 3. les demandes de ces emails, en parallèle
	const [profils, forms] = await Promise.all([
		prisma.profil.findMany({
			where: { OR: anyOfEmails },
			select: {
				email: true,
				firstName: true,
				lastName: true,
				phone: true,
				volunteer: { select: { id: true } },
				host: { select: { id: true } }
			}
		}),
		prisma.form.findMany({
			where: { OR: anyOfEmails },
			orderBy: { createdAt: 'desc' },
			select: { email: true, data: true }
		})
	]);

	const profilByEmail = new Map(profils.map((p) => [p.email.trim().toLowerCase(), p]));

	const formsByEmail = new Map<string, unknown[]>();
	for (const form of forms) {
		const key = form.email.trim().toLowerCase();
		formsByEmail.set(key, [...(formsByEmail.get(key) ?? []), form.data]);
	}

	const people = activeEmails.map((email): BlacklistPerson => {
		const history = byEmail.get(email) ?? [];
		// Les lignes sont triées de la plus récente à la plus ancienne
		const current = history.find((entry) => entry.isBlacklisted)!;
		const profil = profilByEmail.get(email);
		const formsData = formsByEmail.get(email) ?? [];
		const lastForm = formsData[0];

		return {
			email,
			// Le compte d'abord (données vérifiées), sinon la dernière demande
			firstName: profil?.firstName ?? textFrom(lastForm, 'firstName'),
			lastName: profil?.lastName ?? textFrom(lastForm, 'lastName'),
			phone: profil?.phone ?? textFrom(lastForm, 'phone'),
			account: profil?.volunteer ? 'VOLUNTEER' : profil?.host ? 'HOST' : null,
			reason: current.description,
			since: current.createdAt,
			history,
			formsCount: formsData.length
		};
	});

	// Les plus récentes en haut
	people.sort((a, b) => b.since.getTime() - a.since.getTime());

	return { people, liftedCount };
}
