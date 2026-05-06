import type { PrismaCatWithMedia } from '$lib/types/prisma/cat';
import type { Cat } from '$lib/types/cat';

export function mapCat(cat: PrismaCatWithMedia): Cat {
	return {
		id: cat.id,
		name: cat.name ?? 'Sans nom',

		description: cat.description ?? null,
		isOkDog: cat.isOkDog ?? false,
		isOkCat: cat.isOkCat ?? false,
		isOkChild: cat.isOkChild ?? false,

		media: cat.media
			.filter((m) => m.picture !== null)
			.map((m) => ({
				picture: m.picture!
			}))
	};
}
