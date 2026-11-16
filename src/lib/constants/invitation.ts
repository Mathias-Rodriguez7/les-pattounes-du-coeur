// Les candidatures (invitations pas encore acceptées) dans les listes FA et Bénévoles

/** La valeur ajoutée au filtre « Statut » : n'afficher que les candidatures */
export const PENDING_FILTER = 'PENDING';

export const PENDING_FILTER_OPTION = { value: PENDING_FILTER, label: 'En attente de validation' };

/** La recherche par nom, comme pour les fiches */
export function matchesCandidateSearch(candidate: { name: string }, query: string) {
	const q = query.trim().toLowerCase();
	return !q || candidate.name.toLowerCase().includes(q);
}
