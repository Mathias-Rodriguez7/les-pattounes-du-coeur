import type { FocalPoint, SexCat, CatStatus, Vaccinate } from '@prisma/client';

export type CatMedia = {
	picture: string;
	id: string;
	catId: string;
	type: 'image' | 'pdf';
	name: string;
	size: number;
	url: string;
	storageKey: string;
	order: number;
	focalPointX?: number;
	focalPointY?: number;
	uploadedAt: Date;
};

export type Cat = {
	id: string;
	name: string | null;
	sex: SexCat | null;
	birthDate: Date | null;
	formattedAge: string;
	ageBadge: string;
	description: string | null;
	media: CatMedia[];
	focalPoint: FocalPoint;
	isOkDog: boolean;
	isOkCat: boolean;
	isOkChild: boolean;
	isOutside: boolean;
};

export type CatFull = Cat & {
	id: string;
	status: CatStatus;
	isVisible: boolean;
	hairLength: string | null;
	color: string | null;
	origin: string | null;
	isSterilize: boolean;
	isAlreadySterilized: boolean;
	sickness: string | null;
	treatment: string | null;
	vaccinate: Vaccinate | null;
	isFivTest: boolean;
	isDeworming: boolean;
	isIdentify: boolean;
	chipId: string | null;
	placement: {
		startedDate: Date | null;
		endedDate: Date | null;
	};
	currentHost: {
		id: string;
		firstName: string;
		lastName: string;
		phone: string | null;
		email: string;
	} | null;
	referent: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string | null;
	} | null;
	medias?: CatMedia[];
	focalPointX?: number;
	focalPointY?: number;
};

export type CatWithPlacements = {
	id: string;
	name: string | null;
	status: CatStatus;
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
