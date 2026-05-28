import type { Prisma } from '../../../generated/prisma/client';

export type PrismaCatWithMedia = Prisma.CatGetPayload<{
	include: {
		media: true;
	};
}>;
