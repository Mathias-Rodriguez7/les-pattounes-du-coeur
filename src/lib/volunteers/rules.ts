// =====================================================================
// Règles métier d'une demande BÉNÉVOLE, appliquées par le serveur à chaque enregistrement.
// Même raison que pour les FA (voir hosts/rules.ts) : une case décochée fait disparaître sa
// description de la page, le navigateur ne l'envoie plus, et la fusion gardait l'ancienne.
// =====================================================================

/** Chaque case d'expérience décochée efface sa description */
const EXPERIENCE_DESCRIPTIONS = {
	hasCatExperience: 'catExperienceDescription',
	hasAssociationExperience: 'associationExperienceDescription',
	hasMedicalCareExperience: 'medicalCareDescription'
} as const;

export function applyVolunteerRules<T extends Record<string, unknown>>(data: T): T {
	let result: Record<string, unknown> = data;
	for (const [checkbox, description] of Object.entries(EXPERIENCE_DESCRIPTIONS)) {
		// Seulement si la case est explicitement décochée (absente = pas de changement)
		if (result[checkbox] === false) result = { ...result, [description]: null };
	}
	return result as T;
}
