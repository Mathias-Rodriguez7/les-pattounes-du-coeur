export type Cat = {
	id: string;
	name: string | null;
	description: string | null;
	media: CatMedia[];

	isOkDog: boolean;
	isOkCat: boolean;
	isOkChild: boolean;
};

export type CatMedia = {
	picture: string;
};
