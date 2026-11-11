import type { PageServerLoad } from './$types';
import prisma from '#lib/server/prisma.ts';
import { catPublicSelect } from '#lib/types/cat.ts';

export const load: PageServerLoad = async ({ url }) => {
	const catId = url.searchParams.get('cat');

	const cats = await prisma.cat.findMany({
		where: { isVisible: true, status: 'AVAILABLE' },
		select: catPublicSelect,
		orderBy: { createdAt: 'desc' }
	});

	return {
		cats,
		selectedCatId: catId
	};
};
