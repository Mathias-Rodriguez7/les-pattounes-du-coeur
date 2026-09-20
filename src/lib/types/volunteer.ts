import type { Volunteer, Form, Profil, ColabActivity } from '@prisma/client';

export type StatusType = 'ACTIVE' | 'BREAK' | 'STOP';

export type SelectOption = {
	value: string;
	label: string;
};

export type VolunteerEditFormState = {
	isSaving: boolean;
	isDeleting: boolean;
	isBlacklisting: boolean;
};

export type VolunteerEditData = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	district: string;
	address: string;
	city: string;
	postalCode: string;
	actif: StatusType | ColabActivity;
	role: string;
};

export type VolunteerEditFormProps = {
	editData: VolunteerEditData;
	volunteerId?: string;
	profileId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export type CatVolunteerWithRelations = {
	created_at: Date;
	updated_at: Date;
	catId: string;
	volunteerId: string;
	cat: {
		id: string;
		name: string | null;
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
};

export type VolunteerWithRelations = Omit<Volunteer, 'actif'> & {
	actif: ColabActivity | null;
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
