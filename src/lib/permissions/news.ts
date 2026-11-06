import type { VolunteerRole } from '@prisma/client';

const NEWS_EDITORS: VolunteerRole[] = ['ADMIN', 'COMMUNICATION'];

/** Créer, modifier, générer une news */
export function canManageNews(role: VolunteerRole | undefined | null): boolean {
	return !!role && NEWS_EDITORS.includes(role);
}

/** Supprimer : action irréversible → réservée aux admins et au communication */
export function canDeleteNews(role: VolunteerRole | undefined | null): boolean {
	return !!role && NEWS_EDITORS.includes(role);
}
