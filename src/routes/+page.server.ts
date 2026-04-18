import { prisma } from '$lib/server/prisma';

export async function load() {
	const cats = await prisma.cat.findMany({
		where: {
			isVisible: true
		},
		include: {
			media: true
		},
		orderBy: {
			created_at: 'desc'
		}
	});

	return {
		cats
	};
}
