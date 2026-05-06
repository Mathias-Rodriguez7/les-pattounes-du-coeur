import type { NewsType } from '@prisma/client';

export type News = {
	id: string;
	title: string | null;
	content: string | null;
	type: NewsType;

	mediaUrl: string | null;

	createdAt: Date;
	formattedDate: string;

	image: string;

	cats: {
		id: string;
		name: string | null;
		media?: {
			picture: string | null;
		}[];
	}[];
};
