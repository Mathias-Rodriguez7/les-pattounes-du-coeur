// types/cat.ts
import type { Prisma, SexCat, CatStatus, HairLength, Vaccinate } from '@prisma/client';

// ✅ Types Prisma avec relations
export type CatFull = Prisma.CatGetPayload<{
	include: {
		media: true;
		sicknesses: true;
		cares: true;
		volunteers: {
			include: {
				volunteer: true;
			};
		};
		placements: {
			include: {
				host: true;
			};
		};
		adoption: true;
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
	name: string;
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
