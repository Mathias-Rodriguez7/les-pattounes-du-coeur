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
}>;

export type HostEditData = {
	// Infos personnelles
	firstName: string;
	lastName: string;
	birthDate: Date;
	formattedAge: string;
	email: string;
	phone: string;

	// Adresse
	address: string;
	postalCode: string;
	city: string;
	district?: string;

	// Domicile
	space: number;
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
	heal: Heal;
	socialize: Socialize;
	babyFeeding: BabyFeeding;

	// Statut
	type?: HostType;
	actif?: ColabActivity;
	isAvailable: boolean;

	// Autres
	availabilityDuration: string;
	additionalInformation: string;
	stopActivity: string;
};

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
