import type { Prisma } from '@prisma/client';

export type PrismaCatWithMedia = Prisma.CatGetPayload<{
	include: {
		media: true;
	};
}>;
