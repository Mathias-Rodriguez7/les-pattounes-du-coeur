export type Cat = {
	id: string;
	name: string | null;
	sex: string | null;
	age: number;
	formattedAge: string;
	ageBadge: string;
	description: string | null;
	media: CatMedia[];

	isOkDog: boolean;
	isOkCat: boolean;
	isOkChild: boolean;
	isOutside: boolean;
};

export type CatMedia = {
	picture: string;
};

export type CatFull = Cat & {
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
	currentHost: {
		firstName: string;
		lastName: string;
	} | null;
	referent: {
		firstName: string;
		lastName: string;
	} | null;
};
