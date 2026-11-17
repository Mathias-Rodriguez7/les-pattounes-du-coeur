import type { CatStatus, SterilizationPayer } from '@prisma/client';

// Les chats libres : attrapés par une bénévole, stérilisés, puis relâchés sur leur lieu de vie.
// Le statut FREE leur est réservé : on n'y entre (et on n'en sort) que par leurs propres actions.

/** Qui paye la stérilisation. « L'asso » rend le N° Pattounes obligatoire */
export const STERILIZATION_PAYER = {
	ASSO: 'Les Pattounes du Cœur',
	MONTPELLIER: 'Montpellier',
	JUVIGNAC: 'Juvignac',
	LATTES: 'Lattes',
	SAINT_CLEMENT_DE_RIVIERE: 'St Clément de Rivière',
	SAINT_JEAN_DE_VEDAS: 'St Jean de Védas',
	OTHER: 'Autre'
} satisfies Record<SterilizationPayer, string>;

export const STERILIZATION_PAYER_OPTIONS = Object.entries(STERILIZATION_PAYER).map(
	([value, label]) => ({ value, label })
);

/** Le nom de celui qui paye : la commune, ou le nom saisi pour « Autre » */
export function payerLabel(info: { payer: SterilizationPayer; payerOther: string | null }) {
	return info.payer === 'OTHER' ? (info.payerOther ?? 'Autre') : STERILIZATION_PAYER[info.payer];
}

/** L'identification d'un chat libre : une puce (chipId) ou un tatouage (tattooId) */
export const IDENTIFICATION_KIND_OPTIONS = [
	{ value: 'CHIP', label: 'Puce' },
	{ value: 'TATTOO', label: 'Tatouage' }
];
export type IdentificationKind = 'CHIP' | 'TATTOO';

/** Le motif du soin de stérilisation créé avec le chat libre */
export const FREE_CAT_STERILIZATION_REASON = 'Stérilisation (chat libre)';

/** Les statuts possibles en passant en chat asso (tous sauf « Libre ») */
export const ASSO_CAT_STATUSES = [
	'AVAILABLE',
	'SOCIALIZE',
	'ADOPTED',
	'DEAD'
] as const satisfies readonly CatStatus[];
