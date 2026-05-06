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
