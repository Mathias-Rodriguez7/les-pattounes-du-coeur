import type { CatDocumentKind } from '@prisma/client';

export const CAT_SEX = [
	{ value: 'MALE', label: 'Mâle' },
	{ value: 'FEMALE', label: 'Femelle' },
	{ value: 'UNKNOWN', label: 'Inconnu' }
] satisfies Array<{ value: string; label: string }>;

export const CAT_STATUS = [
	{ value: 'AVAILABLE', label: 'Disponible' },
	{ value: 'SOCIALIZE', label: 'Sociabilise' },
	{ value: 'ADOPTED', label: 'Adopté' },
	{ value: 'FREE', label: 'Libre' },
	{ value: 'DEAD', label: 'Décédé' }
] satisfies Array<{ value: string; label: string }>;

export const CAT_HAIR_LENGTH = [
	{ value: 'SHORT', label: 'Court' },
	{ value: 'MEDIUM', label: 'Moyen' },
	{ value: 'LONG', label: 'Long' }
] satisfies Array<{ value: string; label: string }>;

export const CAT_VACCINATE = [
	{ value: 'YES', label: 'Oui' },
	{ value: 'NO', label: 'Non' },
	{ value: 'PARTIAL', label: 'Partiel' }
] satisfies Array<{ value: string; label: string }>;

export const CAT_AGE = [
	{ value: 'Chaton', label: 'Chaton (< 6 mois)' },
	{ value: 'Junior', label: 'Junior (< 3 ans)' },
	{ value: 'Adulte', label: 'Adulte (< 10 ans)' },
	{ value: 'Senior', label: 'Senior (10 ans +)' }
] satisfies Array<{ value: string; label: string }>;

export const CAT_SECTION_CONFIG = {
	statuts: { icon: 'Eye', label: 'Statuts', color: 'cyan' },
	volunteer: { icon: 'users', label: 'Bénévole', color: 'teal' },
	host: { icon: 'house', label: 'FA', color: 'violet' },
	health: { icon: 'cat', label: 'Santé', color: 'fuchsia' },
	sicknesses: { icon: 'syringe', label: 'Maladies', color: 'lime' },
	placements: { icon: 'house', label: 'Accueil', color: 'blue' },
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	compatibility: { icon: 'paw', label: 'Compatibilité', color: 'orange' },
	description: { icon: 'plus', label: 'Description', color: 'gray' },
	adoptions: { icon: 'heart', label: 'Adoptions', color: 'pink' },
	history: { icon: 'history', label: 'Historique des placements', color: 'gray' },
	documents: { icon: 'file', label: 'Documents', color: 'amber' }
} as const;

/** Types de documents administratifs d'un chat */
export const CAT_DOCUMENT_KIND = {
	SURRENDER: { label: "Acte d'abandon", color: 'bg-orange-100 text-orange-800' },
	ADOPTION_CONTRACT: { label: "Contrat d'adoption", color: 'bg-green-100 text-green-800' },
	ADOPTION_RETURN: { label: "Retour d'adoption", color: 'bg-red-100 text-red-800' },
	OTHER: { label: 'Autre document', color: 'bg-gray-100 text-gray-800' }
} satisfies Record<CatDocumentKind, { label: string; color: string }>;

/** Les mêmes, au format attendu par SelectField */
export const CAT_DOCUMENT_KIND_OPTIONS = Object.entries(CAT_DOCUMENT_KIND).map(
	([value, { label }]) => ({ value, label })
);
