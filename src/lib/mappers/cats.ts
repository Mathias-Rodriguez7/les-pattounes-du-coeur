import type { PrismaCatWithMedia } from '$lib/types/prisma/cat';
import type { Cat } from '$lib/types/cat';
import { formatAge, getAgeBadge } from '$lib/utils/age';

export function mapCat(cat: PrismaCatWithMedia): Cat {
	const age = cat.age ?? 1;

	return {
		id: cat.id,
		name: cat.name ?? 'Sans nom',
		age,
		sex: cat.sex,

		formattedAge: formatAge(age),
		ageBadge: getAgeBadge(age),

		description: cat.description ?? null,
		isOkDog: cat.isOkDog ?? false,
		isOkCat: cat.isOkCat ?? false,
		isOkChild: cat.isOkChild ?? false,
		isOutside: cat.isOutside ?? false,

		media: cat.media
			.filter((m) => m.picture !== null)
			.map((m) => ({
				picture: m.picture!
			}))
	};
}
