// src/lib/constants/sos.ts
import type { SosCategory, SosDismissReason, SosSource, SosStatus } from '@prisma/client';

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

// =====================================================================
// Le suivi d'un SOS dans l'appli (page SOS) : statut, catégorie, provenance, fin sans suite.
// label : badges et listes · color : badge
// =====================================================================

export const SOS_STATUS = {
	NEW: { label: 'À traiter', color: 'bg-amber-100 text-amber-800' },
	IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
	CLOSED: { label: 'Clôturé', color: 'bg-green-100 text-green-800' },
	DISMISSED: { label: 'Sans suite', color: 'bg-gray-100 text-gray-700' }
} satisfies Record<SosStatus, { label: string; color: string }>;

/** L'ordre des puces de filtre (Object.keys garde l'ordre d'écriture) */
export const SOS_STATUS_ORDER = Object.keys(SOS_STATUS) as SosStatus[];

/** La catégorie choisie par la bénévole (remplace le type choisi sur le site) */
export const SOS_CATEGORY = {
	GIVEN: { label: 'Chat donné', color: 'bg-violet-100 text-violet-800' },
	FOUND: { label: 'Chat trouvé', color: 'bg-blue-100 text-blue-800' },
	TREATED: { label: 'Chat soigné', color: 'bg-rose-100 text-rose-800' },
	STERILIZED: { label: 'Chat stérilisé', color: 'bg-teal-100 text-teal-800' }
} satisfies Record<SosCategory, { label: string; color: string }>;

export const SOS_CATEGORY_OPTIONS = (Object.keys(SOS_CATEGORY) as SosCategory[]).map((value) => ({
	value,
	label: SOS_CATEGORY[value].label
}));

export const SOS_SOURCE = {
	WEBSITE: 'Via le site',
	PHONE: 'Téléphone',
	EMAIL: 'Mail',
	OTHER: 'Autre'
} satisfies Record<SosSource, string>;

/** Pour la saisie à la main : « Via le site » n'a pas de sens (c'est automatique) */
export const SOS_MANUAL_SOURCE_OPTIONS = (['PHONE', 'EMAIL', 'OTHER'] as const).map((value) => ({
	value,
	label: SOS_SOURCE[value]
}));

export const SOS_DISMISS_REASON = {
	DECEASED: 'Chat(s) décédé(s)',
	NOT_FOUND: 'Introuvable',
	FALSE_ALARM: 'Fausse alerte',
	OTHER: 'Autre'
} satisfies Record<SosDismissReason, string>;

export const SOS_DISMISS_REASON_OPTIONS = (
	Object.keys(SOS_DISMISS_REASON) as SosDismissReason[]
).map((value) => ({ value, label: SOS_DISMISS_REASON[value] }));
