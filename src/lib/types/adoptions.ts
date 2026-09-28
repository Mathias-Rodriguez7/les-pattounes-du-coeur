import type { Prisma } from '@prisma/client';

export type AdoptionWithProfil = Prisma.AdoptionGetPayload<{
	include: {
		profil: true;
	};
}>;
