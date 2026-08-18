export type Cat = {
	id: string;
	name: string | null;
	sex: string | null;
	birthDate: Date | null;
	formattedAge: string;
	ageBadge: string;
	description: string | null;
	media: CatMedia[];
	focalPoint: 'TOP' | 'MID' | 'BOT';

	isOkDog: boolean;
	isOkCat: boolean;
	isOkChild: boolean;
	isOutside: boolean;
};

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

export type CatFull = Cat & {
	id: string;
	status: string;
	isVisible: boolean;
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
	isIdentify: boolean;
	chipId: string | null;
	placement: {
		startedDate: Date | null;
		endedDate: Date | null;
	};
	currentHost: {
		firstName: string;
		lastName: string;
	} | null;
	referent: {
		firstName: string;
		lastName: string;
	} | null;
	medias?: CatMedia[];
	focalPointX?: number;
	focalPointY?: number;
};
