import type { Prisma } from '../../../generated/prisma/client';

export type PrismaCatWithMedia = Prisma.CatGetPayload<{
	include: {
		media: true;
	};
}>;

export type PrismaCatFull = Prisma.CatGetPayload<{
	include: {
		media: true;
		placements: {
			include: {
				host: {
					include: {
						profil: true;
					};
				};
			};
		};
		volunteers: {
			include: {
				volunteer: {
					include: {
						profil: true;
					};
				};
			};
		};
	};
}>;
