export type MediaCat = {
	id: string;
	catId: string;
	picture: string | null;
	fille: string | null;
	created_at: Date;
	updated_at: Date;
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
	media: MediaCat[];
};

export type AdoptionTrendItem = {
	created_at: Date;
	_count: {
		id: number;
	};
};
