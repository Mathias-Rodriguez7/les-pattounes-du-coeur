import type {
	Prisma,
	Volunteer,
	VolunteerRole,
	Form,
	Profil,
	Host,
	ColabActivity
} from '@prisma/client';

/** Les champs secrets d'un bénévole : jamais renvoyés par Prisma (voir src/lib/server/prisma.ts) */
export const volunteerSecretFields = {
	password: true,
	resetToken: true,
	resetTokenExpiresAt: true
} as const;

type VolunteerSecretField = keyof typeof volunteerSecretFields;

export type SelectOption = {
	value: string;
	label: string;
};

export type VolunteerFull = Prisma.VolunteerGetPayload<{
	omit: typeof volunteerSecretFields;
	include: {
		profil: true;
		cats: {
			include: {
				cat: true;
			};
		};
		assignedForms: true;
	};
}> & {
	// ✅ Force le typage des enums
	actif: ColabActivity;
	role: VolunteerRole;
};

export type VolunteerEditFormState = {
	isSaving: boolean;
	isDeleting: boolean;
	isBlacklisting: boolean;
};

export type VolunteerEditData = {
	// Statut
	actif: ColabActivity;
	role: VolunteerRole;
	breakStart?: Date | null;
	breakEnd?: Date | null;

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
};

export type VolunteerEditFormProps = {
	editData: VolunteerEditData;
	volunteerId?: string;
	profileId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

export type CatVolunteerWithRelations = {
	createdAt: Date;
	updatedAt: Date;
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

export type VolunteerWithRelations = Omit<Volunteer, 'actif' | VolunteerSecretField> & {
	actif: ColabActivity | null;
	/** host : la bénévole est aussi famille d'accueil (chargé par la page Bénévoles) */
	profil: Profil & { host?: Host | null };
	cats: CatVolunteerWithRelations[];
	assignedForms: Form[];
	breakStart?: Date | null;
	breakEnd?: Date | null;
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

export type VolunteerBasic = {
	id: string;
	profil: {
		firstName: string;
		lastName: string;
	};
};
