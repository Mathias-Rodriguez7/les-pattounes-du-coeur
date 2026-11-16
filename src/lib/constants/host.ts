import type { BabyFeeding, Heal, HostType, Socialize } from '@prisma/client';
import { PERSON_SECTION_CONFIG } from '#lib/constants/person.ts';

/**
 * LES types de FA, écrits UNE fois : libellé, abréviation (tableau), couleur du badge.
 * `Record<HostType, …>` : si on ajoute une valeur à l'enum Prisma et qu'on l'oublie ici,
 * TypeScript refuse de compiler. Les listes ci-dessous en sont toutes dérivées.
 */
export const HOST_TYPES: Record<HostType, { label: string; short: string; color: string }> = {
	CLASSIC: { label: 'Classic', short: 'Cla', color: 'bg-purple-100 text-purple-800' },
	LONG: { label: 'Long', short: 'Lon', color: 'bg-indigo-100 text-indigo-800' },
	SOS: { label: 'SOS', short: 'SOS', color: 'bg-orange-100 text-orange-800' },
	ADOPT: { label: 'Adoption', short: 'Ado', color: 'bg-green-100 text-green-800' },
	PROPRIO: { label: 'Propriétaire', short: 'Pro', color: 'bg-cyan-100 text-cyan-800' },
	RELAY: { label: 'Relais', short: 'Rel', color: 'bg-pink-100 text-pink-800' }
};

const hostTypeEntries = Object.entries(HOST_TYPES) as [HostType, (typeof HOST_TYPES)[HostType]][];

export const HOST_ACTIF_OPTIONS = [
	{ value: 'ACTIVE', label: 'Actif' },
	{ value: 'BREAK', label: 'Pause' },
	{ value: 'STOP', label: 'Arrêté' }
] satisfies Array<{ value: string; label: string }>;

/** Pour les SelectField (filtres, formulaires) */
export const HOST_TYPE_OPTIONS = hostTypeEntries.map(([value, { label }]) => ({ value, label }));

// =====================================================================
// Soins, sociabilisation, biberonnage : chaque option écrite UNE fois.
// label : formulaires, survol | short : badges | level : sa place sur l'échelle (0 à 3)
// La couleur vient du NIVEAU, la même pour les trois : on lit l'échelle d'un coup d'œil.
// Les options sont écrites dans l'ordre des niveaux : c'est l'ordre des listes déroulantes.
// =====================================================================

export type HostLevel = 0 | 1 | 2 | 3;

/** L'échelle commune : 0 = non (gris, ce n'est pas une erreur), 3 = le plus fort (vert) */
export const LEVEL_COLORS: Record<HostLevel, string> = {
	0: 'bg-gray-100 text-gray-700',
	1: 'bg-amber-100 text-amber-800',
	2: 'bg-blue-100 text-blue-800',
	3: 'bg-green-100 text-green-800'
};

type LevelInfo = { label: string; short: string; level: HostLevel };

export const HOST_HEAL: Record<Heal, LevelInfo> = {
	NO: { label: 'Pas de soins', short: 'Aucun', level: 0 },
	LIGHT: { label: 'Soins légers : comprimés, collyre', short: 'Légers', level: 1 },
	HEAVY: { label: 'Soins lourds : pansements, suivi quotidien', short: 'Lourds', level: 2 },
	HEAVY_STING: { label: 'Soins lourds avec injections', short: 'Injections', level: 3 }
};

export const HOST_SOCIALIZE: Record<Socialize, LevelInfo> = {
	NO: { label: 'Ne sociabilise pas', short: 'Non', level: 0 },
	WITHOUT_EX: { label: 'Sans expérience', short: 'Débutante', level: 1 },
	EXPERIENCED: { label: 'Expérimentée', short: 'Confirmée', level: 2 },
	// Le plus fort : elle sait gérer les chats les plus difficiles
	FEARFUL: { label: 'Spécialiste des craintifs', short: 'Craintifs', level: 3 }
};

export const HOST_BABY_FEEDING: Record<BabyFeeding, LevelInfo> = {
	NO: { label: 'Pas de biberonnage', short: 'Non', level: 0 },
	// Relais : seulement des relais courts, donc moins qu'une FA qui biberonne seule
	RELAY: { label: 'En relais seulement', short: 'Relais', level: 1 },
	WITHOUT_EX: { label: 'Sans expérience', short: 'Débutante', level: 2 },
	EXPERIENCED: { label: 'Expérimentée', short: 'Confirmée', level: 3 }
};

/** La couleur du badge d'une option (gris si la valeur est inconnue) */
export function levelColor(info: LevelInfo | undefined): string {
	return LEVEL_COLORS[info?.level ?? 0];
}

/** Pour les SelectField (filtres, formulaires) : le libellé complet */
const toOptions = <K extends string>(levels: Record<K, LevelInfo>) =>
	(Object.entries(levels) as [K, LevelInfo][]).map(([value, { label }]) => ({ value, label }));

/** Pour les badges des listes : le libellé court et la couleur du niveau */
const toColors = <K extends string>(levels: Record<K, LevelInfo>) =>
	Object.fromEntries(
		(Object.entries(levels) as [K, LevelInfo][]).map(([value, info]) => [
			value,
			{ label: info.short, color: levelColor(info) }
		])
	) as Record<string, { label: string; color: string }>;

export const HOST_HEAL_OPTIONS = toOptions(HOST_HEAL);
export const HOST_SOCIALIZE_OPTIONS = toOptions(HOST_SOCIALIZE);
export const HOST_BABY_FEEDING_OPTIONS = toOptions(HOST_BABY_FEEDING);

export const HOST_SECTION_CONFIG = {
	statuts: { icon: 'Eye', label: 'Statuts', color: 'cyan' },
	...PERSON_SECTION_CONFIG,
	pause: { icon: 'CirclePause', label: 'Pause', color: 'pink' },
	Experience: { icon: 'star', label: 'Expérience', color: 'amber' },
	home: { icon: 'house', label: "Zone d'accueil", color: 'blue' },
	animals: { icon: 'paw', label: 'Animaux', color: 'orange' },
	household: { icon: 'users', label: 'Composition du foyer', color: 'teal' },
	capacity: { icon: 'biceps', label: 'Capacités', color: 'indigo' },
	cat: { icon: 'cat', label: 'Type de chats', color: 'fuchsia' },
	homeDescription: { icon: 'house', label: 'Description du domicile', color: 'blue' },
	presence: { icon: 'clock', label: 'Présence à domicile', color: 'indigo' },
	outsideDescription: { icon: 'trees', label: 'Description du jardin', color: 'green' },
	stopActivity: { icon: 'CircleX', label: "Raison d'arrêt", color: 'red' },
	additionalInformation: { icon: 'plus', label: 'Infos additionnelles', color: 'gray' },
	placements: { icon: 'house', label: 'Placements', color: 'emerald' },
	motivation: { icon: 'heart', label: 'Motivation', color: 'rose' },
	notes: { icon: 'note', label: 'Notes de la bénévole', color: 'gray' },
	documents: { icon: 'file', label: 'Documents', color: 'teal' }
} as const;

// Couleurs pour les types
// (abréviation : les colonnes du tableau sont étroites)
export const typesColors: Record<string, { label: string; color: string }> = Object.fromEntries(
	hostTypeEntries.map(([value, { short, color }]) => [value, { label: short, color }])
);

export const healColors = toColors(HOST_HEAL);

export const socializeColors = toColors(HOST_SOCIALIZE);

export const statusColors: Record<string, { label: string; color: string }> = {
	ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-800' },
	BREAK: { label: 'Pause', color: 'bg-gray-100 text-gray-800' },
	STOP: { label: 'Arrêté', color: 'bg-red-100 text-red-800' }
};

export const babyFeedingColors = toColors(HOST_BABY_FEEDING);

export const STATUS_CONFIG: Record<string, { label: string; icon: string; theme: string }> = {
	ACTIVE: { label: 'En activité', icon: 'CirclePlay', theme: 'activ' },
	BREAK: { label: 'En pause', icon: 'CirclePause', theme: 'break' },
	STOP: { label: 'Arrêté', icon: 'CircleX', theme: 'stop' }
};

// Badges en toutes lettres (panneaux)
export const TYPE_COLORS: Record<string, { label: string; color: string }> = Object.fromEntries(
	hostTypeEntries.map(([value, { label, color }]) => [value, { label, color }])
);
