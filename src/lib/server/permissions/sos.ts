import type { VolunteerRole } from '@prisma/client';

// Qui peut faire quoi sur un SOS. Des fonctions simples (sans base) : faciles à tester.

type User = { id: string; role: VolunteerRole };
type SosRights = { status: string; handledById: string | null };

const isAdmin = (user: User) => user.role === 'ADMIN';

/**
 * Voir le contact de la personne qui signale (données personnelles) :
 * l'admin, et la bénévole qui traite le SOS. Les autres voient le SOS sans le contact.
 */
export function canSeeReporter(user: User, sos: SosRights): boolean {
	return isAdmin(user) || sos.handledById === user.id;
}

/** Le prendre en charge : un SOS à traiter, que personne n'a encore pris */
export function canTakeSos(user: User, sos: SosRights): boolean {
	return sos.status === 'NEW' && sos.handledById === null && !!user.id;
}

/** Le compléter, le classer sans suite, créer ou rattacher ses chats : celle qui le traite, ou l'admin */
export function canHandleSos(user: User, sos: SosRights): boolean {
	return isAdmin(user) || (sos.handledById === user.id && sos.status !== 'NEW');
}
