import type { Prisma, Heal, Socialize, BabyFeeding, HostType, ColabActivity } from '@prisma/client';

// Types Prisma avec relations
export type HostFull = Prisma.HostGetPayload<{
	include: {
		profil: true;
		placements: {
			include: {
				cat: true;
			};
		};
	};
}> & {
	// ✅ Force le typage des enums
	heal: Heal;
	socialize: Socialize;
	babyFeeding: BabyFeeding;
	actif: ColabActivity;
	type: HostType;
};

export type HostEditData = {
	// Statut
	type?: HostType;
	actif?: ColabActivity;
	breakStart?: Date | null;
	breakEnd?: Date | null;
	isAvailable: boolean;

	// Profil
	firstName: string;
	lastName: string;
	birthDate: Date;
	email: string;
	phone: string;

	// Adresse
	address: string;
	postalCode: string;
	city: string;
	district?: string;

	// Domicile
	space: number;
	outside: boolean;
	isStockFeed: boolean;
	car: boolean;

	// Animaux
	hasAnimalsAtHome: boolean;
	numberOfCatsAtHome?: number;
	numberOfDogsAtHome?: number;
	otherAnimalsAtHome?: string;

	// Capacités
	heal: Heal;
	socialize: Socialize;
	babyFeeding: BabyFeeding;

	// Cat
	catAdult: number;
	kittyAndKitten: boolean;
	kitten: number;

	// Descriptions
	homeDescription: string;
	presence: string;
	outsideDescription?: string;
	stopActivity?: string;
	additionalInformation?: string;
};

export type HostBasic = Prisma.HostGetPayload<{
	include: {
		profil: true;
	};
}>;

export type HostEditFormProps = {
	editData: HostEditData;
	hostId?: string;
	profileId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export type HostFormErrors = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
};

export type HostCreateInput = Omit<HostEditData, 'email' | 'phone' | 'firstName' | 'lastName'> & {
	profilId: string;
};

export type HostUpdateInput = Partial<HostEditData>;

// Fix: liste de hosts pour les tableaux
export type HostFullList = HostFull[];
