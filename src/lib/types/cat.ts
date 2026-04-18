export type Cat = {
	id: string;
	name: string | null;
	description: string | null;
	media: CatMedia[];
};

export type CatMedia = {
	picture: string;
};
