import type {
	FormType,
	ColabActivity,
	HostType,
	Heal,
	Socialize,
	BabyFeeding
} from '@prisma/client';
import type { StatusType } from './volunteer';

export const hostTypeLabel: Record<HostType, string> = {
	CLASSIC: 'Accueil Long',
	SOS: 'SOS',
	ADOPT: 'Adoption',
	PROPRIO: 'Proprio',
	RELAY: 'Relais'
};

export const colabActivityLabel: Record<ColabActivity, string> = {
	ACTIVE: 'Actif',
	BREAK: 'En pause',
	STOP: 'Arrêté'
};

export const healLabel: Record<Heal, string> = {
	NO: 'Non',
	LIGHT: 'Léger',
	HEAVY: 'Lourd',
	HEAVY_STING: 'Seringue'
};

export const socializeLabel: Record<Socialize, string> = {
	NO: 'Non',
	FEARFUL: 'Craintif',
	WITHOUT_EX: 'Sans XP',
	EXPERIENCED: 'Avec XP'
};

export const babyFeedingLabel: Record<BabyFeeding, string> = {
	NO: 'Non',
	WITHOUT_EX: 'Sans XP',
	EXPERIENCED: 'Avec XP',
	RELAY: 'Relais'
};

export const FORM_TYPE_CONFIG: Record<FormType, { icon: string; theme: string }> = {
	ADOPTION: { icon: 'heart', theme: 'adoptions' },
	VOLUNTEER: { icon: 'users', theme: 'volunteers' },
	HOST: { icon: 'house', theme: 'fa' },
	COLAB: { icon: 'Handshake', theme: 'colab' },
	ALERT: { icon: 'alert', theme: 'stop' },
	OTHER: { icon: 'other', theme: 'other' }
};

export const FORM_TYPE_LABELS: Record<FormType, string> = {
	ADOPTION: 'Adoptions',
	VOLUNTEER: 'Bénévoles',
	HOST: "Familles d'accueil",
	COLAB: 'Collaborations',
	ALERT: 'Alertes',
	OTHER: 'Autres'
};

export const FORM_TYPES: FormType[] = ['ADOPTION', 'VOLUNTEER', 'HOST', 'COLAB', 'ALERT', 'OTHER'];

export const STATUS_CONFIG: Record<StatusType, { icon: string; label: string; theme: string }> = {
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
