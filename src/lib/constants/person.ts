/**
 * Les sections « personne » (profil, contact, adresse), communes aux bénévoles, aux FA et aux
 * adoptants. Les configurations de chaque page les reprennent avec `...PERSON_SECTION_CONFIG`.
 */
export const PERSON_SECTION_CONFIG = {
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	contact: { icon: 'phone', label: 'Contact', color: 'sky' },
	address: { icon: 'map', label: 'Adresse', color: 'gray' }
} as const;
