import { prisma } from '$lib/server/prisma';
import { mapCat } from '$lib/mappers/cat';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search');

	const okDog = url.searchParams.get('okDog');
	const okCat = url.searchParams.get('okCat');
	const okChild = url.searchParams.get('okChild');

	const sex = url.searchParams.get('sex');
	const age = url.searchParams.get('age');
	const garden = url.searchParams.get('garden');

	const selectedCatId = url.searchParams.get('cat');

	// -----------------------------
	// WHERE dynamique
	// -----------------------------
	const where: any = {
		isVisible: true
	};

	// SEARCH
	if (search) {
		where.name = {
			contains: search,
			mode: 'insensitive'
		};
	}

	// BOOLEAN
	if (okDog !== null) where.isOkDog = okDog === 'true';
	if (okCat !== null) where.isOkCat = okCat === 'true';
	if (okChild !== null) where.isOkChild = okChild === 'true';

	if (garden !== null) where.isOutside = garden === 'true';

	// SEX
	if (sex && sex !== 'ALL') {
		where.sex = sex;
	}

	// AGE
	if (age === 'LT1') {
		where.age = { lt: 1 };
	}

	if (age === '2_5') {
		where.age = { gte: 2, lte: 5 };
	}

	if (age === 'GT5') {
		where.age = { gt: 5 };
	}

	// -----------------------------
	// QUERY
	// -----------------------------
	const cats = await prisma.cat.findMany({
		where,
		include: {
			media: true
		},
		orderBy: {
			created_at: 'desc'
		}
	});

	return {
		cats: cats.map(mapCat),
		selectedCatId
	};
};
