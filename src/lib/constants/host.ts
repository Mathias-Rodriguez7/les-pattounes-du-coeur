export const HOST_ACTIF_OPTIONS = [
	{ value: 'ACTIVE', label: 'Activite' },
	{ value: 'BREAK', label: 'Pause' },
	{ value: 'STOP', label: 'Arrêté' }
] satisfies Array<{ value: string; label: string }>;

export const HOST_TYPE_OPTIONS = [
	{ value: 'CLASSIC', label: 'Accueil Long' },
	{ value: 'SOS', label: 'SOS' },
	{ value: 'ADOPT', label: 'Adoption' },
	{ value: 'PROPRIO', label: 'Propriétaire' },
	{ value: 'RELAY', label: 'Relais' }
] satisfies Array<{ value: string; label: string }>;

export const HOST_HEAL_OPTIONS = [
	{ value: 'NO', label: 'Non' },
	{ value: 'LIGHT', label: 'Légé' },
	{ value: 'HEAVY', label: 'Lourd' },
	{ value: 'HEAVY_STING', label: 'Lourd avec seringue' }
] satisfies Array<{ value: string; label: string }>;

export const HOST_SOCIALIZE_OPTIONS = [
	{ value: 'NO', label: 'Non' },
	{ value: 'FEARFUL', label: 'Craintive' },
	{ value: 'WITHOUT_EX', label: 'Sans xp' },
	{ value: 'EXPERIENCED', label: 'Expérimenté' }
] satisfies Array<{ value: string; label: string }>;

export const HOST_BABY_FEEDING_OPTIONS = [
	{ value: 'NO', label: 'Non' },
	{ value: 'WITHOUT_EX', label: 'Sans xp' },
	{ value: 'EXPERIENCED', label: 'Expérimenté' },
	{ value: 'RELAY', label: 'Relai' }
] satisfies Array<{ value: string; label: string }>;

export const HOST_SECTION_CONFIG = {
	statuts: { icon: 'Eye', label: 'Statuts', color: 'cyan' },
	profile: { icon: 'user', label: 'Profil', color: 'emerald' },
	Experience: { icon: 'star', label: 'Expérience', color: 'amber' },
	address: { icon: 'map', label: 'Adresse', color: 'gray' },
	contact: { icon: 'phone', label: 'Contact', color: 'sky' },
	home: { icon: 'house', label: "Zone d'accueil", color: 'blue' },
	animals: { icon: 'paw', label: 'Animaux', color: 'orange' },
	capacity: { icon: 'biceps', label: 'Capacités', color: 'indigo' },
	cat: { icon: 'cat', label: 'Type de chats', color: 'fuchsia' },
	homeDescription: { icon: 'house', label: 'Description du domicile', color: 'blue' },
	presence: { icon: 'clock', label: 'Présence à domicile', color: 'indigo' },
	outsideDescription: { icon: 'trees', label: 'Description du jardin', color: 'green' },
	stopActivity: { icon: 'CircleX', label: "Raison d'arrêt", color: 'red' },
	additionalInformation: { icon: 'plus', label: 'Infos additionnelles', color: 'gray' }
} as const;
