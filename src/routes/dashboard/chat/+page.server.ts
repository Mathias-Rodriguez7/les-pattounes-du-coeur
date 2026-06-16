import prisma from '$lib/server/prisma';
import { mapCatFull } from '$lib/mappers/cats';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const cats = await prisma.cat.findMany({
		include: {
			media: true,
			placements: {
				include: { host: { include: { profil: true } } }
			},
			volunteers: {
				include: { volunteer: { include: { profil: true } } }
			}
		},
		orderBy: { created_at: 'desc' }
	});

	const mapped = cats.map(mapCatFull);
	const total = mapped.length;
	const withVolunteer = mapped.filter((c) => c.referent !== null).length;
	const withHost = mapped.filter((c) => c.currentHost !== null).length;
	const withoutHost = mapped.filter((c) => c.currentHost === null).length;
	const incomplete = mapped.filter(
		(c) => !c.name || !c.description || !c.hairLength || !c.color || !c.vaccinate
	).length;

	// Pour le sélecteur de FA et de bénévoles
	const hosts = await prisma.host.findMany({
		include: { profil: true }
	});

	const volunteers = await prisma.volunteer.findMany({
		include: { profil: true }
	});

	return {
		cats: mapped,
		stats: { total, withVolunteer, withHost, withoutHost, incomplete },
		hosts: hosts.map((h) => ({
			id: h.id,
			firstName: h.profil.firstName,
			lastName: h.profil.lastName
		})),
		volunteers: volunteers.map((v) => ({
			id: v.id,
			role: v.role,
			firstName: v.profil.firstName,
			lastName: v.profil.lastName
		}))
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
			data: { name, sex: sex as any, age, status: status as any }
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
				sex: (str('sex') as any) ?? undefined,
				age: num('age') ?? undefined,
				status: (str('status') as any) ?? undefined,
				isVisible: bool('isVisible'),
				description: str('description'),
				hairLength: (str('hairLength') as any) ?? null,
				color: str('color'),
				origin: str('origin'),
				isSterilize: bool('isSterilize'),
				isAlreadySterilized: bool('isAlreadySterilized'),
				sickness: str('sickness'),
				treatment: str('treatment'),
				vaccinate: (str('vaccinate') as any) ?? null,
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
