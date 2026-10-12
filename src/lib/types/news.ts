import type { Cat } from '$lib/types/cat';
import type { NewsType, CatStatus } from '@prisma/client';

export type News = {
	id: string;
	title: string | null;
	content: string | null;
	type: NewsType;

	mediaUrl: string | null;

	createdAt: Date;
	formattedDate: string;

	image: string;

	cats: Cat[];
};

export interface NewsFull {
	id: string;
	title: string;
	content: string | null;
	type: NewsType;
	mediaUrl: string | null;
	created_at: Date;
	cats: { cat: { id: string; name: string; catNumber: string; status: CatStatus } }[];
}

export interface NewsEditData {
	title: string;
	content: string;
	type: NewsType;
	mediaUrl: string;
	catIds: string[];
}
