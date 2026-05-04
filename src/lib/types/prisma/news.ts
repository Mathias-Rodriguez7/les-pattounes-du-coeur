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
