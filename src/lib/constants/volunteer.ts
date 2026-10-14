export const VOLUNTEER_STATUS_OPTIONS = [
	{ value: 'ACTIVE', label: 'En activité' },
	{ value: 'BREAK', label: 'En pause' },
	{ value: 'STOP', label: 'Arrêté' }
] satisfies Array<{ value: string; label: string }>;

export const VOLUNTEER_ROLE_OPTIONS = [
	{ value: 'ADMIN', label: 'Admin' },
	{ value: 'MANAGER', label: 'Manager' },
	{ value: 'COMMUNICATION', label: 'Communication' }
] satisfies Array<{ value: string; label: string }>;

export const VOLUNTEER_SECTION_CONFIG = {
	statuts: { icon: 'Eye', label: 'Statuts', color: 'cyan' },
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	pause: { icon: 'CirclePause', label: 'Pause', color: 'pink' },
	experience: { icon: 'star', label: 'Expérience', color: 'amber' },
	address: { icon: 'map', label: 'Adresse', color: 'gray' },
	contact: { icon: 'phone', label: 'Contact', color: 'sky' },
	cats: { icon: 'cat', label: 'Chats en gestion', color: 'orange' },
	forms: { icon: 'clipboard', label: 'Formulaires assignés', color: 'green' },
	notes: { icon: 'note', label: 'Notes', color: 'gray' },
	infos: { icon: 'info', label: 'Infos', color: 'gray' },
	motivation: { icon: 'heart', label: 'Motivation', color: 'rose' },
	availability: { icon: 'calendar', label: 'Disponibilité', color: 'indigo' },
	additionalInformation: { icon: 'info', label: 'Informations supplémentaires', color: 'gray' },
	capacity: { icon: 'biceps', label: 'Capacités', color: 'indigo' }
} as const;

// Couleurs pour les rôles
export const roleColors: Record<string, string> = {
	ADMIN: 'bg-red-100 text-red-800',
	MANAGER: 'bg-blue-100 text-blue-800',
	COMMUNICATION: 'bg-purple-100 text-purple-800'
};

export const VOLUNTEER_AVAILABILITY_OPTIONS = [
	{ value: 'LOW', label: 'Faible' },
	{ value: 'MEDIUM', label: 'Moyenne' },
	{ value: 'HIGH', label: 'Élevée' }
];

export const VOLUNTEER_AVAILABILITY_DURATION_OPTIONS = [
	{ value: 'LESS_THAN_1_MONTH', label: "Moins d'1 mois" },
	{ value: '1_TO_3_MONTHS', label: '1 à 3 mois' },
	{ value: '3_TO_6_MONTHS', label: '3 à 6 mois' },
	{ value: 'MORE_THAN_6_MONTHS', label: 'Plus de 6 mois' },
	{ value: 'LONG_TERM', label: 'Long terme' }
];

export const VOLUNTEER_AVAILABILITY_LABELS: Record<string, string> = {
	LOW: 'Faible',
	MEDIUM: 'Moyenne',
	HIGH: 'Élevée'
};

export const VOLUNTEER_AVAILABILITY_DURATION_LABELS: Record<string, string> = {
	LESS_THAN_1_MONTH: "Moins d'1 mois",
	'1_TO_3_MONTHS': '1 à 3 mois',
	'3_TO_6_MONTHS': '3 à 6 mois',
	MORE_THAN_6_MONTHS: 'Plus de 6 mois',
	LONG_TERM: 'Long terme'
};
