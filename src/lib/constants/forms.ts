export const FORM_SECTION_CONFIG = {
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	address: { icon: 'map', label: 'Adresse', color: 'gray' },
	contact: { icon: 'phone', label: 'Contact', color: 'sky' },
	home: { icon: 'house', label: "Zone d'accueil", color: 'blue' },
	animals: { icon: 'paw', label: 'Animaux', color: 'orange' },
	capacity: { icon: 'biceps', label: 'Capacités', color: 'indigo' },
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
	cat: { icon: 'cat', label: 'Type de chats', color: 'fuchsia' },
	homeDescription: { icon: 'house', label: 'Description du domicile', color: 'blue' },
	foyer: { icon: 'house', label: 'Description du foyer', color: 'blue' },
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

export const ADOPTION_FUR_OPTIONS = [
	{ value: 'short', label: 'Court' },
	{ value: 'medium', label: 'Moyen' },
	{ value: 'long', label: 'Long' },
	{ value: 'free', label: 'Sans préférence' }
];

export const ADOPTION_AGE_OPTIONS = [
	{ value: 'kitten', label: 'Chaton' },
	{ value: 'Junior', label: 'Junior' },
	{ value: 'adult', label: 'Adulte' },
	{ value: 'senior', label: 'Senior' },
	{ value: 'free', label: 'Sans préférence' }
];

export const ADOPTION_SEX_OPTIONS = [
	{ value: 'male', label: 'Mâle' },
	{ value: 'female', label: 'Femelle' },
	{ value: 'free', label: 'Sans préférence' }
];

// 🐱 Adoption Form Labels
export const ageLabels: Record<string, string> = {
	kitten: 'Chaton',
	Junior: 'Junior',
	adult: 'Adulte',
	senior: 'Senior',
	free: 'Sans préférence'
};

export const sexLabels: Record<string, string> = {
	male: 'Mâle',
	female: 'Femelle',
	free: 'Sans préférence'
};

export const furLabels: Record<string, string> = {
	short: 'Court',
	medium: 'Moyen',
	long: 'Long',
	free: 'Sans préférence'
};
