export const DISTRICT_LABELS = {
	HOPITAUX_FACULTES: 'Hôpitaux-Facultés',
	CROIX_D_ARGENT: "Croix d'Argent",
	PORT_MARIANNE: 'Port-Marianne',
	CENTRE_VILLE: 'Centre-Ville',
	CEVENNES: 'Cévennes',
	PRES_D_ARENES: "Près d'Arènes",
	MOSSON: 'Mosson'
} as const;

export type District = keyof typeof DISTRICT_LABELS;

/**
 * Les quartiers au format des listes déroulantes (SelectField).
 * Calculé UNE seule fois, ici : tous les formulaires qui proposent un quartier l'importent.
 */
export const DISTRICT_OPTIONS = Object.entries(DISTRICT_LABELS).map(([value, label]) => ({
	value,
	label
}));

/** Le nom lisible d'un quartier ('MOSSON' → 'Mosson'), ou null s'il n'y en a pas */
export function districtLabel(district: string | null | undefined): string | null {
	return district && district in DISTRICT_LABELS ? DISTRICT_LABELS[district as District] : null;
}
