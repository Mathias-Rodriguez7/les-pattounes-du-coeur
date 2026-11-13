import type { HostType } from '@prisma/client';
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
	...PERSON_SECTION_CONFIG,
	pause: { icon: 'CirclePause', label: 'Pause', color: 'pink' },
	Experience: { icon: 'star', label: 'Expérience', color: 'amber' },
	home: { icon: 'house', label: "Zone d'accueil", color: 'blue' },
	animals: { icon: 'paw', label: 'Animaux', color: 'orange' },
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

// Couleur pour les soins
export const healColors: Record<string, { label: string; color: string }> = {
	NO: { label: 'Non', color: 'bg-red-100 text-red-800' },
	LIGHT: { label: 'Léger', color: 'bg-orange-100 text-orange-800' },
	HEAVY: { label: 'Lourd', color: 'bg-green-100 text-green-800' },
	HEAVY_STING: { label: 'Lourd+', color: 'bg-cyan-100 text-cyan-800' }
};

// Couleur pour les socia
export const socializeColors: Record<string, { label: string; color: string }> = {
	NO: { label: 'Non', color: 'bg-red-100 text-red-800' },
	FEARFUL: { label: 'Cra', color: 'bg-orange-100 text-orange-800' },
	WITHOUT_EX: { label: 'XP-', color: 'bg-green-100 text-green-800' },
	EXPERIENCED: { label: 'XP+', color: 'bg-cyan-100 text-cyan-800' }
};

export const statusColors: Record<string, { label: string; color: string }> = {
	ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-800' },
	BREAK: { label: 'Pause', color: 'bg-gray-100 text-gray-800' },
	STOP: { label: 'Arrêté', color: 'bg-red-100 text-red-800' }
};

export const babyFeedingColors: Record<string, { label: string; color: string }> = {
	NO: { label: 'Non', color: 'bg-red-100 text-red-800' },
	WITHOUT_EX: { label: 'Sans xp', color: 'bg-purple-100 text-purple-800' },
	EXPERIENCED: { label: 'Expérimenté', color: 'bg-pink-100 text-pink-800' },
	RELAY: { label: 'Relais', color: 'bg-blue-100 text-blue-800' }
};

export const STATUS_CONFIG: Record<string, { label: string; icon: string; theme: string }> = {
	ACTIVE: { label: 'En activité', icon: 'CirclePlay', theme: 'activ' },
	BREAK: { label: 'En pause', icon: 'CirclePause', theme: 'break' },
	STOP: { label: 'Arrêté', icon: 'CircleX', theme: 'stop' }
};

// Badges en toutes lettres (panneaux)
export const TYPE_COLORS: Record<string, { label: string; color: string }> = Object.fromEntries(
	hostTypeEntries.map(([value, { label, color }]) => [value, { label, color }])
);
