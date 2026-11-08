import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { catGalleryArgs } from '$lib/types/cat';

export const load: PageServerLoad = async ({ url }) => {
	const catId = url.searchParams.get('cat');

	const cats = await prisma.cat.findMany({
		where: { isVisible: true, status: 'AVAILABLE' },
		include: { media: catGalleryArgs },
		orderBy: { createdAt: 'desc' }
	});

	return {
		cats,
		selectedCatId: catId
	};
};
