import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ url }) => {
	const catId = url.searchParams.get('cat');

	const cats = await prisma.cat.findMany({
		where: { isVisible: true },
		include: { media: true },
		orderBy: { created_at: 'desc' }
	});

	return {
		cats,
		selectedCatId: catId
	};
};
