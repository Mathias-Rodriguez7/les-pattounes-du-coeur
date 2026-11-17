import { z } from 'zod';

// =====================================================================
// La composition du foyer d'une FA : combien d'adultes et d'enfants.
// Écrite UNE fois : schémas, formulaires, fiche et tableau lisent cette liste.
// null = pas renseigné (les FA créées avant ce champ), 0 = personne.
// =====================================================================

export const HOUSEHOLD_FIELDS = [
	{ key: 'adultsAtHome', label: 'Adultes', hint: '18 ans et plus', one: 'adulte', many: 'adultes' },
	{
		key: 'childrenAtHome',
		label: 'Enfants',
		hint: 'moins de 18 ans',
		one: 'enfant',
		many: 'enfants'
	}
] as const;

export type HouseholdKey = (typeof HOUSEHOLD_FIELDS)[number]['key'];

/** Les nombres (texte dans un formulaire, nombre en base) */
export type HouseholdData = Partial<Record<HouseholdKey, string | number | null>>;

/**
 * Un nombre facultatif, comme les chats et chiens du foyer : null = « pas renseigné ».
 * Les formulaires envoient null pour un champ vide (convertFormData, toNullableNumber…) :
 * attention, z.coerce transformerait '' en 0.
 */
const optionalCount = z.coerce
	.number()
	.int('Nombre entier attendu')
	.min(0, 'Le nombre doit être positif')
	.nullable()
	.optional();

/** À ajouter aux schémas Zod d'une FA (création, modification, formulaire public) */
export const householdShape = {
	adultsAtHome: optionalCount,
	childrenAtHome: optionalCount
};

const count = (value: string | number | null | undefined) =>
	value === null || value === undefined || value === '' ? null : Number(value);

/** Rien n'est renseigné (FA créée avant ce champ) */
export function isHouseholdUnknown(data: HouseholdData) {
	return HOUSEHOLD_FIELDS.every(({ key }) => count(data[key]) === null);
}

/**
 * Le résumé du foyer : « 2 adultes · 1 enfant » (les 0 sont omis).
 * null si rien n'est renseigné.
 */
export function householdSummary(data: HouseholdData): string | null {
	if (isHouseholdUnknown(data)) return null;
	const parts = HOUSEHOLD_FIELDS.flatMap(({ key, one, many }) => {
		const n = count(data[key]) ?? 0;
		return n > 0 ? [`${n} ${n > 1 ? many : one}`] : [];
	});
	return parts.join(' · ') || 'Personne';
}

/** Le nombre total de personnes (pour trier le tableau) ; -1 si rien n'est renseigné */
export function householdTotal(data: HouseholdData) {
	if (isHouseholdUnknown(data)) return -1;
	return HOUSEHOLD_FIELDS.reduce((sum, { key }) => sum + (count(data[key]) ?? 0), 0);
}
