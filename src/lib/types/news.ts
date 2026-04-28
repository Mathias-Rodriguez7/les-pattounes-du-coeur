import type { Prisma } from '@prisma/client';

export type PrismaNewsWithCats = Prisma.NewsGetPayload<{
	include: {
		cats: {
			include: {
				cat: {
					include: {
						media: true;
					};
				};
			};
		};
	};
}>;

export type News = {
	id: string;
	title: string;
	content: string | null;
	type: NewsType;
	createdAt: Date;
	image: string;

	cats: {
		id: string;
		name: string | null;
		picture: string | null;
	}[];
};

export type NewsType = 'NEWS' | 'EVENT' | 'HISTORY' | 'NEWSCATS' | 'NEWSLETTER';
