import type {
	FormType,
	ColabActivity,
	HostType,
	Heal,
	Socialize,
	BabyFeeding
} from '@prisma/client';
import { HOST_BABY_FEEDING, HOST_HEAL, HOST_SOCIALIZE, HOST_TYPES } from '#lib/constants/host.ts';

// Soins, sociabilisation, biberonnage : dérivés de constants/host.ts (libellé complet)

// Dérivé de HOST_TYPES (constants/host.ts) : un seul endroit pour les libellés
export const hostTypeLabel = Object.fromEntries(
	Object.entries(HOST_TYPES).map(([type, { label }]) => [type, label])
) as Record<HostType, string>;

export const colabActivityLabel: Record<ColabActivity, string> = {
	ACTIVE: 'Actif',
	BREAK: 'En pause',
	STOP: 'Arrêté'
};

export const healLabel = Object.fromEntries(
	Object.entries(HOST_HEAL).map(([value, { label }]) => [value, label])
) as Record<Heal, string>;

export const socializeLabel = Object.fromEntries(
	Object.entries(HOST_SOCIALIZE).map(([value, { label }]) => [value, label])
) as Record<Socialize, string>;

export const babyFeedingLabel = Object.fromEntries(
	Object.entries(HOST_BABY_FEEDING).map(([value, { label }]) => [value, label])
) as Record<BabyFeeding, string>;

export const FORM_TYPE_CONFIG: Record<FormType, { icon: string; theme: string }> = {
	ADOPTION_FLEXIBLE: { icon: 'heart', theme: 'adoptions' },
	ADOPTION_SPECIFIC: { icon: 'heart', theme: 'adoptions' },
	VOLUNTEER: { icon: 'users', theme: 'volunteers' },
	HOST: { icon: 'house', theme: 'fa' },
	COLAB: { icon: 'Handshake', theme: 'colab' },
	OTHER: { icon: 'other', theme: 'other' }
};

export const FORM_TYPE_LABELS: Record<FormType, string> = {
	ADOPTION_FLEXIBLE: 'Adoptions flexibles',
	ADOPTION_SPECIFIC: 'Adoptions spécifiques',
	VOLUNTEER: 'Bénévoles',
	HOST: "Familles d'accueil",
	COLAB: 'Collaborations',
	OTHER: 'Autres'
};

export const FORM_TYPES: FormType[] = [
	'ADOPTION_FLEXIBLE',
	'ADOPTION_SPECIFIC',
	'VOLUNTEER',
	'HOST',
	'COLAB',
	'OTHER'
];

export const STATUS_CONFIG: Record<ColabActivity, { icon: string; label: string; theme: string }> =
	{
		ACTIVE: {
			icon: 'CirclePlay',
			label: 'En activité',
			theme: 'activ'
		},
		BREAK: {
			icon: 'CirclePause',
			label: 'En pause',
			theme: 'break'
		},
		STOP: {
			icon: 'CircleX',
			label: 'Arrêté',
			theme: 'stop'
		}
	} as const;
