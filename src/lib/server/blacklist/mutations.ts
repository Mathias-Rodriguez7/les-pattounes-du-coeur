import prisma from '#lib/server/prisma.ts';
import { isEmailBlacklisted } from '#lib/server/accountStatus.ts';
import type { AddToBlacklistInput, LiftBlacklistInput } from '#lib/schemas/blacklist.ts';

/** Erreur « métier » : son message peut être montré tel quel à l'admin */
export class BlacklistError extends Error {}

/** Comparaison d'email qui ignore la casse (Jean@… = jean@…) */
export const sameEmail = (email: string) => ({
	equals: email.trim(),
	mode: 'insensitive' as const
});

/** Date du jour à Paris (le serveur tourne en UTC : sans ça, la date peut être celle de la veille) */
const todayInParis = () =>
	new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeZone: 'Europe/Paris' }).format(
		new Date()
	);

/**
 * Blackliste un email.
 * Le compte (bénévole ou FA) est retrouvé par le SERVEUR à partir de l'email :
 * on ne fait pas confiance à un identifiant envoyé par le navigateur.
 * Effet : ce compte est désactivé (voir isAccountDisabled) et les demandes de cet email
 * affichent le badge « Blacklisté ».
 */
export async function addToBlacklist({ email, reason }: AddToBlacklistInput) {
	if (await isEmailBlacklisted(email)) {
		throw new BlacklistError('Cet email est déjà blacklisté');
	}

	const profil = await prisma.profil.findFirst({
		where: { email: sameEmail(email) },
		select: { id: true }
	});

	return prisma.blacklistHistoric.create({
		data: {
			email: email.trim().toLowerCase(),
			description: reason,
			isBlacklisted: true,
			profilId: profil?.id ?? null
		}
	});
}

/**
 * Lève la blacklist d'un email. Rien n'est supprimé : la ligne passe à
 * isBlacklisted = false et la raison de la levée est AJOUTÉE à sa description,
 * pour garder l'historique complet. Le compte éventuel se réactive tout seul.
 */
export async function liftBlacklist({ email, reason }: LiftBlacklistInput, liftedBy: string) {
	const active = await prisma.blacklistHistoric.findMany({
		where: { email: sameEmail(email), isBlacklisted: true },
		select: { id: true, description: true }
	});
	if (active.length === 0) {
		throw new BlacklistError("Cet email n'est pas blacklisté");
	}

	const note = `Levée le ${todayInParis()} par ${liftedBy} : ${reason}`;

	// D'anciennes données peuvent avoir plusieurs lignes actives : on les lève toutes, ensemble
	await prisma.$transaction(
		active.map((entry) =>
			prisma.blacklistHistoric.update({
				where: { id: entry.id },
				data: { isBlacklisted: false, description: `${entry.description}\n\n${note}` }
			})
		)
	);
}
