import type { Prisma, Heal, Socialize, BabyFeeding, HostType, ColabActivity } from '@prisma/client';
import { volunteerSecretFields } from '#lib/types/volunteer.ts';
import { activeBlacklistArgs } from '#lib/types/blacklist.ts';

// ✅ Ce que charge une FA complète : la requête ET le type en découlent
export const hostFullArgs = {
	include: {
		// volunteer : HostPanel indique si la FA est aussi bénévole
		// blacklists : sa blacklist active (badge dans HostPanel, filtre de la page FA)
		profil: {
			include: {
				volunteer: { omit: volunteerSecretFields },
				blacklists: activeBlacklistArgs
			}
		},
		placements: { include: { cat: true } }
	}
} satisfies Prisma.HostDefaultArgs;

export type HostFull = Prisma.HostGetPayload<typeof hostFullArgs> & {
	/** Calculé par le load de la page FA : nombre de placements longs et relais */
	placementStats?: { long: number; short: number; total: number };
};

/** Un placement tel que chargé dans la fiche d'une FA (avec le chat) */
export type HostPlacement = HostFull['placements'][number];

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
