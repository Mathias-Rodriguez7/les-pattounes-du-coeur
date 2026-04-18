import type { PageServerLoad } from './$types';
import type { Cat } from '$lib/types/cat';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const cats = await prisma.cat.findMany({
		where: { isVisible: true },
		include: { media: true },
		orderBy: { created_at: 'desc' }
	});

	const formatted: Cat[] = cats.map((cat) => ({
		id: cat.id,
		name: cat.name,
		description: cat.description,
		media: cat.media
			.filter((m) => m.picture !== null)
			.map((m) => ({
				picture: m.picture!
			}))
	}));

	return { cats: formatted };
};
