import prisma from '$lib/server/prisma';
import { mapCatFull } from '$lib/mappers/cats';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { SexCat, CatStatus, HairLength, Vaccinate } from '../../../generated/prisma/client.js';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		throw redirect(302, '/');
	}

	/*
    |--------------------------------------------------------------------------
    | TOUS LES CHATS
    |--------------------------------------------------------------------------
    */

	const isAdmin = user.role === 'ADMIN';

	const cats = await prisma.cat.findMany({
		where: isAdmin
			? {}
			: {
					volunteers: {
						some: {
							volunteerId: user.id
						}
					}
				},
		include: {
			media: true,
			placements: {
				include: {
					host: {
						include: {
							profil: true
						}
					}
				}
			},
			volunteers: {
				include: {
					volunteer: {
						include: {
							profil: true
						}
					}
				}
			}
		},
		orderBy: { created_at: 'desc' }
	});

	/*
    |--------------------------------------------------------------------------
    | STATS
    |--------------------------------------------------------------------------
    */

	const totalManagedCats = await prisma.catVolunteer.count();

	const volunteerCats = await prisma.catVolunteer.count({
		where: { volunteerId: user.id }
	});

	const volunteerCatsWithHost = await prisma.catVolunteer.count({
		where: {
			volunteerId: user.id,
			cat: {
				placements: {
					some: {}
				}
			}
		}
	});

	const volunteerCatsWithoutHost = await prisma.catVolunteer.count({
		where: {
			volunteerId: user.id,
			cat: {
				placements: {
					none: {}
				}
			}
		}
	});

	const volunteerCatsIncomplete = await prisma.catVolunteer.count({
		where: {
			volunteerId: user.id,
			cat: {
				OR: [
					{ name: null },
					{ description: null },
					{ chipId: null },
					{ age: null },
					{ color: null },
					{ isOkCat: null },
					{ isOkDog: null },
					{ isOkChild: null },
					{ isOutside: null }
				]
			}
		}
	});

	// Récupérer hosts et volunteers
	const hosts = await prisma.host.findMany({ include: { profil: true } });
	const volunteers = await prisma.volunteer.findMany({ include: { profil: true } });
	/*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

	return {
		user,
		cats: cats.map(mapCatFull),
		hosts,
		volunteers,
		isAdmin,
		stats: {
			volunteerCats,
			totalManagedCats,
			volunteerCatsWithHost,
			volunteerCatsWithoutHost,
			volunteerCatsIncomplete,
			volunteerCatsTotal: volunteerCats
		}
	};
};

export const actions: Actions = {
	createCat: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString() || null;
		const sex = data.get('sex')?.toString();
		const age = parseInt(data.get('age')?.toString() ?? '0');
		const status = data.get('status')?.toString();

		if (!sex || !status) return fail(400, { message: 'Champs manquants' });

		await prisma.cat.create({
			data: { name, sex: sex as SexCat, age, status: status as CatStatus }
		});
	},

	updateCat: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { message: 'ID manquant' });

		const bool = (key: string) => data.get(key) === 'true';
		const str = (key: string) => {
			const v = data.get(key)?.toString();
			return v && v !== '' ? v : null;
		};
		const num = (key: string) => {
			const v = data.get(key)?.toString();
			return v ? parseInt(v) : null;
		};

		await prisma.cat.update({
			where: { id },
			data: {
				name: str('name'),
				sex: (str('sex') as SexCat) ?? undefined,
				age: num('age') ?? undefined,
				status: (str('status') as CatStatus) ?? undefined,
				isVisible: bool('isVisible'),
				description: str('description'),
				hairLength: (str('hairLength') as HairLength) ?? null,
				color: str('color'),
				origin: str('origin'),
				isSterilize: bool('isSterilize'),
				isAlreadySterilized: bool('isAlreadySterilized'),
				sickness: str('sickness'),
				treatment: str('treatment'),
				vaccinate: (str('vaccinate') as Vaccinate) ?? null,
				isFivTest: bool('isFivTest'),
				isDeworming: bool('isDeworming'),
				isIdentify: bool('isIdentify'),
				chipId: str('chipId'),
				isOkDog: bool('isOkDog'),
				isOkCat: bool('isOkCat'),
				isOkChild: bool('isOkChild'),
				isOutside: bool('isOutside')
			}
		});

		// Gestion FA (placement)
		const hostIdRaw = data.get('hostId')?.toString();
		const hostId = hostIdRaw && hostIdRaw !== '' ? hostIdRaw : null;

		// Toujours fermer le placement actif
		await prisma.placement.updateMany({
			where: { catId: id, ended: null },
			data: { ended: new Date() }
		});

		// Créer un nouveau placement seulement si une FA est choisie
		if (hostId) {
			await prisma.placement.create({
				data: { catId: id, hostId, ended: null }
			});
		}
	},

	assignVolunteer: async ({ request, locals }) => {
		// Vérification ADMIN
		const session = locals.session;
		if (!session || session.volunteer?.role !== 'ADMIN') {
			return fail(403, { message: 'Accès refusé' });
		}

		const data = await request.formData();
		const catId = data.get('catId')?.toString();
		const volunteerId = data.get('volunteerId')?.toString();

		if (!catId) return fail(400, { message: 'ID manquant' });

		// Supprimer l'ancien référent
		await prisma.catVolunteer.deleteMany({ where: { catId } });

		// Assigner le nouveau si fourni
		if (volunteerId) {
			await prisma.catVolunteer.create({ data: { catId, volunteerId } });
		}
	}
};
