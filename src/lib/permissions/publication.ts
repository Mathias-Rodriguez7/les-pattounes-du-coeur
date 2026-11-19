import type { VolunteerRole } from '@prisma/client';

// Le circuit de publication d'un chat : la bénévole du chat PROPOSE, l'admin ou une bénévole
// COMMUNICATION VALIDE (le chat devient visible sur le site). Partagé navigateur / serveur.

const PUBLISHERS: VolunteerRole[] = ['ADMIN', 'COMMUNICATION'];

/** Publier (rendre visible) un chat, valider ou refuser une demande de publication */
export function canPublishCats(role: VolunteerRole | undefined | null): boolean {
	return !!role && PUBLISHERS.includes(role);
}

/** Où en est la publication d'un chat, vu par sa bénévole (onglet « Publication ») */
export type PublicationState = 'REFUSED' | 'PENDING' | 'PUBLISHED';

interface PublicationFields {
	status: string;
	isVisible: boolean;
	publicationRequestedAt: Date | string | null;
	publicationRefusedAt: Date | string | null;
}

/** null : le chat n'a pas de publication à suivre (jamais proposé, adopté, chat libre) */
export function publicationState(cat: PublicationFields): PublicationState | null {
	if (cat.status === 'FREE' || cat.status === 'ADOPTED') return null;
	if (cat.publicationRequestedAt) return 'PENDING';
	if (cat.isVisible) return 'PUBLISHED';
	if (cat.publicationRefusedAt) return 'REFUSED';
	return null;
}

/** Libellé et couleurs (les mêmes que le bandeau de la fiche). Ordre = ordre de la liste */
export const PUBLICATION_STATE = {
	REFUSED: { label: 'Refusé', rank: 0, badgeClass: 'bg-amber-100 text-amber-800' },
	PENDING: { label: 'En attente', rank: 1, badgeClass: 'bg-sky-100 text-sky-800' },
	PUBLISHED: { label: 'Publié', rank: 2, badgeClass: 'bg-green-100 text-green-800' }
} satisfies Record<PublicationState, { label: string; rank: number; badgeClass: string }>;
