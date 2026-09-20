import type { MediaCat } from '@prisma/client';

export type CatMediaExtended = MediaCat & {
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

export type CatWithMedia = {
	id: string;
	name: string | null;
	sex: string;
	birthDate: Date | null;
	isVisible: boolean;
	status: string;
	hairLength: string | null;
	color: string | null;
	origin: string | null;
	isSterilize: boolean;
	isAlreadySterilized: boolean;
	sickness: string | null;
	treatment: string | null;
	vaccinate: string | null;
	isFivTest: boolean;
	isDeworming: boolean;
	description: string | null;
	isOkCat: boolean | null;
	isOkDog: boolean | null;
	isOkChild: boolean | null;
	isOutside: boolean | null;
	isIdentify: boolean;
	chipId: string | null;
	focalPoint: string | null;
	created_at: Date;
	updated_at: Date;
	media: CatMediaExtended[];
};

export type AdoptionTrendItem = {
	created_at: Date;
	_count: {
		id: number;
	};
};
