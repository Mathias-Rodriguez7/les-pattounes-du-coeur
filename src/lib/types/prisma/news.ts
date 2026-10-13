import type { Prisma } from '../@prisma/client/client';

export type PrismaNewsWithCats = Prisma.NewsGetPayload<{
	select: {
		id: true;
		title: true;
		type: true;
		content: true;
		mediaUrl: true;
		createdAt: true;
		updatedAt: true;
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
