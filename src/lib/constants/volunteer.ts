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
	Experience: { icon: 'star', label: 'Expérience', color: 'amber' },
	address: { icon: 'map', label: 'Adresse', color: 'gray' },
	contact: { icon: 'phone', label: 'Contact', color: 'sky' },
	cats: { icon: 'cat', label: 'Chats en gestion', color: 'orange' },
	forms: { icon: 'clipboard', label: 'Formulaires assignés', color: 'green' }
} as const;
