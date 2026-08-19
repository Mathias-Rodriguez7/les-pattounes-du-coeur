import type { PrismaCatWithMedia, PrismaCatFull } from '$lib/types/prisma/cat';
import type { Cat, CatFull } from '$lib/types/cat';
import { formatAge, getAgeBadge } from '$lib/utils/age';

export function mapCat(cat: PrismaCatWithMedia): Cat {
	return {
		id: cat.id,
		name: cat.name ?? 'Sans nom',
		birthDate: cat.birthDate ?? null,
		sex: cat.sex,
		formattedAge: formatAge(cat.birthDate),
		ageBadge: getAgeBadge(cat.birthDate),
		description: cat.description ?? null,
		isOkDog: cat.isOkDog ?? false,
		isOkCat: cat.isOkCat ?? false,
		isOkChild: cat.isOkChild ?? false,
		isOutside: cat.isOutside ?? false,
		media: cat.media.filter((m) => m.picture !== null).map((m) => ({ picture: m.picture! })),
		focalPoint: (cat.focalPoint as 'TOP' | 'MID' | 'BOT') ?? 'MID'
	};
}

export function mapCatFull(cat: PrismaCatFull): CatFull {
	const activePlacement = cat.placements.find((p) => !p.ended);
	const referentLink = cat.volunteers[0];

	return {
		id: cat.id,
		name: cat.name ?? 'Sans nom',
		birthDate: cat.birthDate ?? null,
		sex: cat.sex,
		formattedAge: formatAge(cat.birthDate),
		ageBadge: getAgeBadge(cat.birthDate),
		description: cat.description ?? null,
		isOkDog: cat.isOkDog ?? false,
		isOkCat: cat.isOkCat ?? false,
		isOkChild: cat.isOkChild ?? false,
		isOutside: cat.isOutside ?? false,
		media: cat.media.filter((m) => m.picture !== null).map((m) => ({ picture: m.picture! })),
		focalPoint: (cat.focalPoint as 'TOP' | 'MID' | 'BOT') ?? 'MID',

		status: cat.status,
		isVisible: cat.isVisible,
		hairLength: cat.hairLength ?? null,
		color: cat.color ?? null,
		origin: cat.origin ?? null,
		isSterilize: cat.isSterilize,
		isAlreadySterilized: cat.isAlreadySterilized,
		sickness: cat.sickness ?? null,
		treatment: cat.treatment ?? null,
		vaccinate: cat.vaccinate ?? null,
		isFivTest: cat.isFivTest,
		isDeworming: cat.isDeworming,
		isIdentify: cat.isIdentify,
		chipId: cat.chipId ?? null,

		currentHost: activePlacement
			? {
					id: activePlacement.host.id,
					firstName: activePlacement.host.profil.firstName,
					lastName: activePlacement.host.profil.lastName,
					phone: activePlacement.host.profil.phone,
					email: activePlacement.host.profil.email
				}
			: null,

		referent: referentLink
			? {
					id: referentLink.volunteer.id,
					firstName: referentLink.volunteer.profil.firstName,
					lastName: referentLink.volunteer.profil.lastName,
					phone: referentLink.volunteer.profil.phone,
					email: referentLink.volunteer.profil.email
				}
			: null
	};
}
