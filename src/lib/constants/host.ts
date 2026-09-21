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
	profile: { icon: 'user', label: 'Profil' },
	address: { icon: 'map', label: 'Adresse' },
	home: { icon: 'house', label: "Zone d'accueil" },
	animals: { icon: 'paw', label: 'Animaux' },
	capacity: { icon: 'heart', label: 'Capacités' },
	homeDescription: { icon: 'house', label: 'Description du domicile' },
	outsideDescription: { icon: 'trees', label: 'Description du jardin' },
	stopActivity: { icon: 'CircleX', label: "Raison d'arrêt" },
	additionalInformation: { icon: 'plus', label: 'Infos additionnelles' }
} as const;
