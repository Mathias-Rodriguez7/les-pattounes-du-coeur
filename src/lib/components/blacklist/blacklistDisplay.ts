import type { BlacklistPerson } from '#lib/types/blacklist.ts';

export const ACCOUNT_LABELS: Record<NonNullable<BlacklistPerson['account']>, string> = {
	VOLUNTEER: 'Bénévole',
	HOST: "Famille d'accueil"
};

/** « Prénom Nom », ou null si on ne connaît pas le nom (ni compte, ni demande) */
export function personName(person: Pick<BlacklistPerson, 'firstName' | 'lastName'>) {
	const name = [person.firstName, person.lastName].filter(Boolean).join(' ');
	return name || null;
}
