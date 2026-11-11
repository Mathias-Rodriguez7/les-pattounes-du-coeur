import type { FormStatus, Prisma } from '@prisma/client';
import { catProfileSelect } from './catProfile';

export type FormType = 'ADOPTION' | 'VOLUNTEER' | 'HOST' | 'COLAB' | 'OTHER';

// ===== DONNÉES SPÉCIFIQUES PAR TYPE =====

export type AdoptionFormData = {
	firstName: string;
	lastName: string;
	birthDate: Date;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	district: string;
	catAge: string;
	catSex: string;
	color: string;
	furLength: string;
	temperament: string;
	housingSize: number;
	hasGarden: boolean;
	gardenSize?: number;
	hasPets: boolean;
	numberOfCats: number;
	numberOfDogs: number;
	otherPets: string;
	numberOfChildren: number;
};

export type AdoptionFormJson = Partial<Omit<AdoptionFormData, 'birthDate'>> & {
	birthDate?: string | null;
};

export type VolunteerFormData = {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	address: string;
	birthDate: string | Date;
	city: string;
	postalCode: string;
	district: string;
	hasCatExperience: boolean;
	catExperienceDescription?: string;
	hasAssociationExperience: boolean;
	associationExperienceDescription?: string;
	hasMedicalCareExperience: boolean;
	medicalCareDescription?: string;
	hasTransportExperience: boolean;
	car: boolean;
	availability: 'LOW' | 'MEDIUM' | 'HIGH';
	availabilityDuration:
		'LESS_THAN_1_MONTH' | '1_TO_3_MONTHS' | '3_TO_6_MONTHS' | 'MORE_THAN_6_MONTHS' | 'LONG_TERM';
	canHelpWeekdays: boolean;
	canHelpWeekends: boolean;
	canHelpEmergencies: boolean;
	motivation: string;
	skills?: string;
	additionalInformation?: string;
};

export type HostFormData = {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	address: string;
	birthDate: string | Date;
	city: string;
	postalCode: string;
	district: string;
	space: number;
	outside: boolean;
	outsideDescription?: string;
	hasAnimalsAtHome: boolean;
	numberOfCatsAtHome?: number;
	numberOfDogsAtHome?: number;
	otherAnimalsAtHome?: string;
	homeDescription: string;
	type: string;
	heal: string;
	socialize: string;
	car: boolean;
	babyFeeding: string;
	catAdult: number;
	kittyAndKitten: boolean;
	kitten?: number;
	presence: string;
	motivation: string;
	additionalMessage?: string;
};

export type CollabFormData = {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	companyName?: string;
	presentation: string;
	partnershipProposal: string;
};

export type OtherFormData = Record<string, any>;

// ===== TYPE UNION =====
export type AnyFormData =
	AdoptionFormData | VolunteerFormData | HostFormData | CollabFormData | OtherFormData;

// ===== ÉDITION =====
export type FormEditData<T extends AnyFormData = AnyFormData> = {
	status: FormStatus;
	email: string;
	data: T;
	notes?: string | null;
};

/**
 * Une demande, avec juste ce que les panneaux affichent.
 * Partagé : page Formulaires ET fiche du chat (les demandes en attente du chat)
 */
export const formInclude = {
	assignedTo: {
		select: { id: true, profil: { select: { firstName: true, lastName: true } } }
	},
	cat: {
		select: {
			// Le profil complet du chat : le panneau l'affiche pour juger la compatibilité
			...catProfileSelect,
			id: true,
			name: true,
			catNumber: true,
			sex: true,
			birthDate: true,
			status: true,
			// La référente en premier (la plus ancienne bénévole associée)
			volunteers: {
				orderBy: { createdAt: 'asc' },
				select: {
					volunteer: {
						select: { id: true, profil: { select: { firstName: true, lastName: true } } }
					}
				}
			}
		}
	}
} satisfies Prisma.FormInclude;

/** Une demande telle que les panneaux la reçoivent (avec la bénévole assignée et le chat) */
export type FormWithRelations = Prisma.FormGetPayload<{ include: typeof formInclude }>;

/** Une entrée active de la liste noire, telle qu'on l'affiche aux bénévoles */
export type BlacklistInfo = { reason: string; since: Date };

/** Une demande avec, si son email est sur liste noire, la raison (calculée par le load) */
export type FormWithBlacklist = FormWithRelations & { blacklist: BlacklistInfo | null };
