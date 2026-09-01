import type { Volunteer, Form, Profil } from '@prisma/client';

export type FormType = 'ADOPTION' | 'VOLUNTEER' | 'HOST' | 'COLAB' | 'ALERT' | 'OTHER';
export type StatusType = 'ACTIVE' | 'BREAK' | 'STOP';

export type CatWithPlacements = {
	id: string;
	name: string;
	status: string;
	placements?: Array<{
		id: string;
		host: {
			profil: {
				firstName: string;
				lastName: string;
			};
		};
	}>;
};

export type CatVolunteerWithRelations = {
	created_at: Date;
	updated_at: Date;
	catId: string;
	volunteerId: string;
	cat: CatWithPlacements;
};

export type VolunteerWithRelations = Omit<Volunteer, 'actif'> & {
	actif: StatusType | null;
	profil: Profil;
	cats: CatVolunteerWithRelations[];
	assignedForms: Form[];
};

export type CatVolunteerExtended = {
	catId: string;
	catName: string;
	catStatus: string;
	hostFirstName: string | null;
	hostLastName: string | null;
	placementId: string | null;
	hasPlacement: boolean;
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
