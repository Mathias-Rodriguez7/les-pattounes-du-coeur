import type { VolunteerRole } from '@prisma/client';

// Qui peut faire quoi sur un SOS. Des fonctions simples (sans base) : faciles à tester.

type User = { id: string; role: VolunteerRole };
type SosRights = {
	status: string;
	handledById: string | null;
	/** Les bénévoles en renfort (ajoutées par l'admin) : mêmes droits que celle qui le traite */
	helperIds?: string[];
};

const isAdmin = (user: User) => user.role === 'ADMIN';

/** Elle traite ce SOS : la responsable, ou une bénévole en renfort */
const isOnSos = (user: User, sos: SosRights) =>
	sos.handledById === user.id || (sos.helperIds ?? []).includes(user.id);

/**
 * Voir le contact de la personne qui signale (données personnelles) :
 * l'admin, la bénévole qui traite le SOS et ses renforts. Les autres voient le SOS sans le contact.
 */
export function canSeeReporter(user: User, sos: SosRights): boolean {
	return isAdmin(user) || isOnSos(user, sos);
}

/** Le prendre en charge : un SOS à traiter, que personne n'a encore pris */
export function canTakeSos(user: User, sos: SosRights): boolean {
	return sos.status === 'NEW' && sos.handledById === null && !!user.id;
}

/** Le compléter, le classer sans suite, créer ou rattacher ses chats : celle qui le traite, ou l'admin */
export function canHandleSos(user: User, sos: SosRights): boolean {
	return isAdmin(user) || (isOnSos(user, sos) && sos.status !== 'NEW');
}
