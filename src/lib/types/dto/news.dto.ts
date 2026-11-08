import type { NewsType } from '@prisma/client';

export type NewsDTO = {
	id: string;
	title: string;
	content: string | null;
	type: NewsType;
	createdAt: Date;

	cats: {
		id: string;
		name: string | null;
		media: {
			picture: string | null;
		}[];
	}[];
};
