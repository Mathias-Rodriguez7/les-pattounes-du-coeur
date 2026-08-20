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

// Récupère les clés directement sans Object.keys()
export const DISTRICTS = [
	'HOPITAUX_FACULTES',
	'CROIX_D_ARGENT',
	'PORT_MARIANNE',
	'CENTRE_VILLE',
	'CEVENNES',
	'PRES_D_ARENES',
	'MOSSON'
] as const;
