// src/lib/constants/sos.ts

/** Les types de signalement SOS : utilisés par le formulaire, le schéma ET l'e-mail */
export const SOS_ALERT_TYPES = {
	abandon: 'Abandon / problème de comportement dans le foyer',
	unneutered: 'Chats errants non stérilisés',
	sociable_stray: 'Chat sociable sans propriétaire',
	found_kittens: 'Chatons trouvés / vus',
	danger: 'Chat en danger',
	other: 'Autre'
} as const;

export type SosAlertType = keyof typeof SOS_ALERT_TYPES;

/** Au format attendu par SelectField */
export const SOS_ALERT_TYPE_OPTIONS = Object.entries(SOS_ALERT_TYPES).map(([value, label]) => ({
	value,
	label
}));
