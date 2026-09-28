import type {
	Prisma,
	SexCat,
	CatStatus,
	HairLength,
	Vaccinate,
	Sickness,
	Placement,
	Volunteer,
	Adoption,
	Care,
	Media,
	News
} from '@prisma/client';

// ✅ Types Prisma avec relations
export type CatFull = Prisma.CatGetPayload<{
	include: {
		media: true;
		sicknesses: true;
		cares: true;
		volunteers: {
			include: {
				volunteer: {
					include: {
						profil: true;
					};
				};
			};
		};
		placements: {
			include: {
				host: {
					include: {
						profil: true;
					};
				};
			};
		};
		adoptions: {
			include: {
				profil: true;
			};
		};

		news: true;
	};
}> & {
	// ✅ Force le typage des enums
	sex: SexCat;
	status: CatStatus;
	hairLength: HairLength;
	vaccinate: Vaccinate;
};

// ✅ Type pour l'édition
export type CatEditData = {
	catNumber: string;
	name: string | null;
	sex: SexCat;
	birthDate: Date | null;
	description: string | null;

	// Infos santé
	isSterilize: boolean;
	isAlreadySterilized: boolean;
	vaccinate: Vaccinate;
	isFivTest: boolean;
	isDeworming: boolean;

	// Identification
	isIdentify: boolean;
	chipId: string | null;

	// Compatibilités
	isOkDog: boolean;
	isOkCat: boolean;
	isOkChild: boolean;
	isOutside: boolean;

	// Apparence
	hairLength: HairLength;
	color: string;
	origin: string;

	// Visibilité
	isVisible: boolean;
	status: CatStatus;

	sicknesses?: Sickness[];
	placements?: Placement[];
	volunteers?: Volunteer[];
	adoptions?: Adoption[];
	cares?: Care[];
	media?: Media[];
	news?: News[];
};

// ✅ Type pour les props du formulaire
export type CatEditFormProps = {
	editData: CatEditData;
	catId?: string;
	onSuccess?: () => void;
	onCancel?: () => void;
};

// ✅ Type pour les erreurs
export type CatFormErrors = {
	name?: string;
	sex?: string;
	birthDate?: string;
	description?: string;
};

// ✅ Type pour créer un chat
export type CatCreateInput = Omit<CatEditData, 'id'> & {
	catNumber: string;
	media?: Array<{
		picture: string;
		focalPointX: number;
		focalPointY: number;
	}>;
};

// ✅ Type pour mettre à jour un chat
export type CatUpdateInput = Partial<CatEditData>;
