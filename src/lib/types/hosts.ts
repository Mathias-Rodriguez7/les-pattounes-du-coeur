import type { Prisma } from '@prisma/client';

// Types de base
export type Host = Prisma.HostGetPayload<true>;
export type Profil = Prisma.ProfilGetPayload<true>;
export type Placement = Prisma.PlacementGetPayload<true>;

// Type complet avec relations
export type HostFull = Prisma.HostGetPayload<{
	include: {
		profil: true;
		placements: {
			include: {
				cat: true;
			};
		};
	};
}>;

// Pour les formulaires
export type HostFormData = {
	// Infos personnelles
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	age: number;
	job: string;

	// Adresse
	address: string;
	postalCode: string;
	city: string;
	district?: string;

	// Domicile
	space: 'SMALL' | 'MEDIUM' | 'LARGE';
	presence: string;
	outside: boolean;
	outsideDescription?: string;
	homeDescription: string;
	isStockFeed: boolean;
	car: boolean;

	// Animaux
	hasAnimalsAtHome: boolean;
	numberOfCatsAtHome?: number;
	numberOfDogsAtHome?: number;
	otherAnimalsAtHome?: string;

	// Capacités
	heal: 'NO' | 'LIGHT' | 'HEAVY' | 'HEAVY_STING';
	socialize: 'NO' | 'FEARFUL' | 'WITHOUT_EX' | 'EXPERIENCED';
	babyFeeding: 'NO' | 'WITHOUT_EX' | 'EXPERIENCED' | 'RELAY';

	// Statut
	type?: 'CLASSIC' | 'RELAY';
	status: 'FREE' | 'CAT_PLACE' | 'WAITING' | 'WAITING_VALIDATION';
	actif?: 'ACTIVE' | 'BREAK' | 'STOP';
	isAvailable: boolean;

	// Autres
	availabilityDuration: string;
	additionalInformation: string;
	stopActivity: string;
};

// Pour les créations
export type HostCreateInput = Omit<HostFormData, 'email' | 'phone' | 'firstName' | 'lastName'> & {
	profilId: string;
};

// Pour les mises à jour
export type HostUpdateInput = Partial<HostFormData>;

// Énums (alignés avec Prisma)
export const HostStatus = {
	FREE: 'FREE',
	CAT_PLACE: 'CAT_PLACE',
	WAITING: 'WAITING',
	WAITING_VALIDATION: 'WAITING_VALIDATION'
} as const;

export const HostType = {
	CLASSIC: 'CLASSIC',
	RELAY: 'RELAY'
} as const;

export const ColabActivity = {
	ACTIVE: 'ACTIVE',
	BREAK: 'BREAK',
	STOP: 'STOP'
} as const;

export const Space = {
	SMALL: 'SMALL',
	MEDIUM: 'MEDIUM',
	LARGE: 'LARGE'
} as const;

export const Heal = {
	NO: 'NO',
	LIGHT: 'LIGHT',
	HEAVY: 'HEAVY',
	HEAVY_STING: 'HEAVY_STING'
} as const;

export const Socialize = {
	NO: 'NO',
	FEARFUL: 'FEARFUL',
	WITHOUT_EX: 'WITHOUT_EX',
	EXPERIENCED: 'EXPERIENCED'
} as const;

export const BabyFeeding = {
	NO: 'NO',
	WITHOUT_EX: 'WITHOUT_EX',
	EXPERIENCED: 'EXPERIENCED',
	RELAY: 'RELAY'
} as const;

// Labels pour les sélects/affichage
export const hostStatusLabel: Record<string, string> = {
	FREE: 'Disponible',
	CAT_PLACE: 'Chat placé',
	WAITING: 'En attente',
	WAITING_VALIDATION: 'En attente de validation'
};

export const hostTypeLabel: Record<string, string> = {
	CLASSIC: 'Accueil Long',
	RELAY: 'Relais'
};

export const colabActivityLabel: Record<string, string> = {
	ACTIVE: 'Actif',
	BREAK: 'En pause',
	STOP: 'Arrêté'
};

export const spaceLabel: Record<string, string> = {
	SMALL: 'Petit',
	MEDIUM: 'Moyen',
	LARGE: 'Grand'
};

export const healLabel: Record<string, string> = {
	NO: 'Aucun',
	LIGHT: 'Léger',
	HEAVY: 'Lourd',
	HEAVY_STING: 'Très lourd'
};

export const socializeLabel: Record<string, string> = {
	NO: 'Aucune',
	FEARFUL: 'Craintif',
	WITHOUT_EX: 'Sans expérience',
	EXPERIENCED: 'Expérimenté'
};

export const babyFeedingLabel: Record<string, string> = {
	NO: 'Non',
	WITHOUT_EX: 'Sans expérience',
	EXPERIENCED: 'Expérimenté',
	RELAY: 'Relais'
};
