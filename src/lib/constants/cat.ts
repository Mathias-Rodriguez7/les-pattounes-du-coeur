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

export const CAT_SECTION_CONFIG = {
	statuts: { icon: 'Eye', label: 'Statuts', color: 'cyan' },
	volunteers: { icon: 'user', label: 'Bénévoles', color: 'emerald' },
	host: { icon: 'house', label: 'FA', color: 'blue' },
	health: { icon: 'cat', label: 'Santé', color: 'fuchsia' },
	sicknesses: { icon: 'bandage', label: 'Maladies', color: 'red' },
	placements: { icon: 'house', label: 'Accueil', color: 'blue' },
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	compatibility: { icon: 'paw', label: 'Compatibilité', color: 'orange' },
	description: { icon: 'plus', label: 'Description', color: 'gray' },
	adoptions: { icon: 'Heart', label: 'Adoptions', color: 'red' }
} as const;
