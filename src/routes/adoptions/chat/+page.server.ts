import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { mapCat } from '$lib/mappers/cats';

export const load: PageServerLoad = async ({ url }) => {
	const catId = url.searchParams.get('cat');

	const cats = await prisma.cat.findMany({
		where: { isVisible: true },
		include: { media: true },
		orderBy: { created_at: 'desc' }
	});

	return {
		cats: cats.map(mapCat),
		selectedCatId: catId
	};
};
