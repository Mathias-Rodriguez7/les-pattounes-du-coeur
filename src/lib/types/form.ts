import type { FormStatus } from '@prisma/client';

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

export type CollaborationFormData = {
	// À définir...
};

export type OtherFormData = Record<string, any>;

// ===== TYPE UNION =====
export type AnyFormData =
	AdoptionFormData | VolunteerFormData | HostFormData | CollaborationFormData | OtherFormData;

// ===== ÉDITION =====
export type FormEditData<T extends AnyFormData = AnyFormData> = {
	status: FormStatus;
	email: string;
	data: T;
	notes?: string | null;
};
