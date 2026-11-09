export const FORM_SECTION_CONFIG = {
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	address: { icon: 'map', label: 'Adresse', color: 'gray' },
	contact: { icon: 'phone', label: 'Contact', color: 'sky' },
	home: { icon: 'house', label: "Zone d'accueil", color: 'blue' },
	animals: { icon: 'paw', label: 'Animaux', color: 'orange' },
	capacity: { icon: 'biceps', label: 'Capacités', color: 'indigo' },
	catSpecific: { icon: 'cat', label: 'Profil du chat ', color: 'fuchsia' },
	cat: { icon: 'cat', label: 'Type de chats', color: 'fuchsia' },
	homeDescription: { icon: 'house', label: 'Description du domicile', color: 'blue' },
	presence: { icon: 'clock', label: 'Présence à domicile', color: 'indigo' },
	outsideDescription: { icon: 'trees', label: 'Description du jardin', color: 'green' },
	additionalInformation: { icon: 'plus', label: 'Infos additionnelles', color: 'gray' },
	foyer: { icon: 'house', label: 'Description du foyer', color: 'blue' },
	notes: { icon: 'note', label: 'Notes de la bénévole', color: 'gray' }
} as const;

export const ADOPTION_SECTION_CONFIG = {
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	address: { icon: 'map', label: 'Adresse', color: 'gray' },
	contact: { icon: 'phone', label: 'Contact', color: 'sky' },
	home: { icon: 'house', label: "Zone d'accueil", color: 'blue' },
	animals: { icon: 'paw', label: 'Animaux', color: 'orange' },
	catSpecific: { icon: 'cat', label: 'Profil du chat ', color: 'fuchsia' },
	cat: { icon: 'cat', label: 'Type de chats', color: 'fuchsia' },
	homeDescription: { icon: 'house', label: 'Description du domicile', color: 'blue' },
	foyer: { icon: 'house', label: 'Description du foyer', color: 'blue' },
	temperament: { icon: 'cat', label: 'Tempérament du chat', color: 'fuchsia' },
	notes: { icon: 'note', label: 'Notes de la bénévole', color: 'gray' }
} as const;

export const FORM_TYPE_OPTIONS = [
	{ value: 'ADOPTION_SPECIFIC', label: 'Adoption spécifique' },
	{ value: 'ADOPTION_FLEXIBLE', label: 'Adoption flexible' },
	{ value: 'VOLUNTEER', label: 'Bénévole' },
	{ value: 'HOST', label: 'FA' },
	{ value: 'COLAB', label: 'Collaboration' },
	{ value: 'OTHER', label: 'Autre' }
];

export const FORM_STATUS_OPTIONS = [
	{ value: 'PENDING', label: 'En attente' },
	{ value: 'APPROVED', label: 'Approuvé' },
	{ value: 'REJECTED', label: 'Rejeté' }
];

export const statusColors: Record<string, { label: string; color: string }> = {
	PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
	APPROVED: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
	REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
};

export const typesLabels: Record<string, { label: string; color: string }> = {
	ADOPTION_SPECIFIC: { label: 'Spéc', color: 'bg-rose-100 text-rose-800' },
	ADOPTION_FLEXIBLE: { label: 'Flex', color: 'bg-rose-100 text-rose-800' },
	VOLUNTEER: { label: 'Bén', color: 'bg-purple-100 text-purple-800' },
	HOST: { label: 'FA', color: 'bg-emerald-100 text-emerald-800' },
	COLAB: { label: 'Col', color: 'bg-orange-100 text-orange-800' },
	OTHER: { label: 'Aut', color: 'bg-gray-100 text-gray-800' }
};

// 🐱 Préférences de l'adoptant (formulaire libre) : UNE source par liste.
// Le formulaire, le dashboard et le schéma Zod en dérivent : ils ne peuvent plus diverger.
export const CAT_AGE_PREFERENCES = {
	kitten: 'Chaton',
	junior: 'Junior',
	adult: 'Adulte',
	senior: 'Senior',
	free: 'Sans préférence'
} as const;

export const CAT_SEX_PREFERENCES = {
	male: 'Mâle',
	female: 'Femelle',
	free: 'Sans préférence'
} as const;

export const CAT_FUR_PREFERENCES = {
	short: 'Court',
	medium: 'Moyen',
	long: 'Long',
	free: 'Sans préférence'
} as const;

/** { clé: libellé } → [{ value, label }] pour SelectField */
const toOptions = (labels: Record<string, string>) =>
	Object.entries(labels).map(([value, label]) => ({ value, label }));

/** Les clés d'une liste, au format attendu par z.enum (au moins une valeur) */
export const enumKeys = <T extends Record<string, string>>(labels: T) =>
	Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]];

// Les noms d'avant sont gardés : les composants qui les utilisent n'ont pas à changer
export const ADOPTION_AGE_OPTIONS = toOptions(CAT_AGE_PREFERENCES);
export const ADOPTION_SEX_OPTIONS = toOptions(CAT_SEX_PREFERENCES);
export const ADOPTION_FUR_OPTIONS = toOptions(CAT_FUR_PREFERENCES);

export const ageLabels: Record<string, string> = CAT_AGE_PREFERENCES;
export const sexLabels: Record<string, string> = CAT_SEX_PREFERENCES;
export const furLabels: Record<string, string> = CAT_FUR_PREFERENCES;
