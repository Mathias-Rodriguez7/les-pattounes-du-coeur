import type { Prisma } from '@prisma/client';

export type PrismaNewsWithCats = Prisma.NewsGetPayload<{
	select: {
		id: true;
		title: true;
		type: true;
		content: true;
		mediaUrl: true;
		created_at: true;
		updated_at: true;
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
