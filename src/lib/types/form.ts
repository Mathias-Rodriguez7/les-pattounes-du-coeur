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
	// À définir...
};

export type HostFormData = {
	// À définir...
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
