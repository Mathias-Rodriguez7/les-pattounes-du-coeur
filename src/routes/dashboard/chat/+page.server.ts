// src/routes/dashboard/+page.server.ts

import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { mapCatFull } from '$lib/mappers/cats';
import {
	PlacementError,
	OverlapError,
	NotFoundError,
	InvalidStateError,
	validateDates
} from '$lib/server/placements';

export type PageData = {
	cats: ReturnType<typeof mapCatFull>[];
	stats: {
		total: number;
		withVolunteer: number;
		withHost: number;
		withoutHost: number;
		incomplete: number;
	};
	hosts: Array<{ id: string; firstName: string; lastName: string }>;
	volunteers: Array<{ id: string; role: string; firstName: string; lastName: string }>;
	isAdmin: boolean;
};

export const load: PageServerLoad = async ({ locals }) => {
	// Optionnel: vérifier l'auth si besoin
	// if (!locals.user) {
	//   redirect(302, '/login');
	// }

	try {
		// ==========================================
		// RÉCUPÉRER TOUS LES CHATS
		// ==========================================
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

		// ==========================================
		// RÉCUPÉRER HOSTS ET VOLUNTEERS POUR SELECTS
		// ==========================================
		const hosts = await prisma.host.findMany({
			include: { profil: true }
		});

		const volunteers = await prisma.volunteer.findMany({
			include: { profil: true }
		});

		const isAdmin = locals.user?.role === 'ADMIN' || false;

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
			})),
			isAdmin
		};
	} catch (err) {
		console.error('Erreur dans load dashboard:', err);
		throw error(500, 'Erreur lors du chargement du dashboard');
	}
};

export const actions: Actions = {
	// ==========================================
	// ACTION: Créer un chat
	// ==========================================
	createCat: async ({ request }) => {
		try {
			const data = await request.formData();
			const name = data.get('name')?.toString() || null;
			const sex = data.get('sex')?.toString();
			const age = parseInt(data.get('age')?.toString() ?? '0');
			const status = data.get('status')?.toString();

			if (!sex || !status) return fail(400, { message: 'Champs manquants' });

			await prisma.cat.create({
				data: { name, sex: sex as any, age, status: status as any }
			});

			return { success: true };
		} catch (err) {
			console.error('Erreur createCat:', err);
			return fail(500, { message: 'Erreur lors de la création' });
		}
	},

	// ==========================================
	// ACTION: Mettre à jour un chat
	// ==========================================
	updateCat: async ({ request }) => {
		try {
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
				where: { catId: id, status: 'ACTIVE' },
				data: { status: 'CLOSED', endedDate: new Date() }
			});

			// Créer un nouveau placement seulement si une FA est choisie
			if (hostId) {
				await prisma.placement.create({
					data: {
						catId: id,
						hostId,
						type: 'LONG',
						status: 'ACTIVE',
						startedDate: new Date(),
						notes: ''
					}
				});
			}

			return { success: true };
		} catch (err) {
			console.error('Erreur updateCat:', err);
			return fail(500, { message: 'Erreur lors de la mise à jour' });
		}
	},

	// ==========================================
	// ACTION: Assigner un bénévole référent
	// ==========================================
	assignVolunteer: async ({ request, locals }) => {
		try {
			// Vérification ADMIN
			if (!locals.user || locals.user.role !== 'ADMIN') {
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

			return { success: true };
		} catch (err) {
			console.error('Erreur assignVolunteer:', err);
			return fail(500, { message: "Erreur lors de l'assignation" });
		}
	},

	// ==========================================
	// ACTION 1: Ajouter ou Remplacer FA LONG
	// ==========================================
	addOrReplaceLongPlacement: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const catId = formData.get('catId') as string;
			const hostId = formData.get('hostId') as string;
			const startedDate = new Date(formData.get('startedDate') as string);
			const endedDate = formData.get('endedDate')
				? new Date(formData.get('endedDate') as string)
				: null;

			// Validation
			if (!catId || !hostId) {
				throw new PlacementError('catId et hostId sont requis', 'INVALID_DATES');
			}

			validateDates(startedDate, endedDate || undefined);

			// Vérifier les chevauchements
			const existingPlacements = await prisma.placement.findMany({
				where: {
					catId,
					status: { not: 'CLOSED' }
				}
			});

			const hasOverlap = existingPlacements.some((p) => {
				if (p.endedDate && startedDate >= p.endedDate) return false;
				if (endedDate && p.startedDate >= endedDate) return false;
				return true;
			});

			if (hasOverlap) {
				throw new OverlapError('Un placement chevauche cette période');
			}

			// Récupérer les anciens placements
			const oldPlacements = await prisma.placement.findMany({
				where: {
					catId,
					type: 'LONG',
					status: { not: 'CLOSED' }
				}
			});

			// Créer le nouveau placement
			const newPlacement = await prisma.placement.create({
				data: {
					catId,
					hostId,
					startedDate,
					endedDate,
					type: 'LONG',
					status: 'ACTIVE',
					notes: (formData.get('notes') as string) || ''
				},
				include: {
					host: true,
					cat: true
				}
			});

			// Clôturer les anciens
			if (oldPlacements.length > 0) {
				await prisma.placement.updateMany({
					where: { id: { in: oldPlacements.map((p) => p.id) } },
					data: { status: 'CLOSED', endedDate: startedDate }
				});
			}

			return { success: true, placement: newPlacement };
		} catch (err) {
			if (err instanceof PlacementError) {
				return fail(err.statusCode, { message: err.message });
			}
			console.error('Erreur addOrReplaceLongPlacement:', err);
			return fail(500, { message: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION 2: Ajouter FA SHORT
	// ==========================================
	addShortPlacement: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const catId = formData.get('catId') as string;
			const hostId = formData.get('hostId') as string;
			const startedDate = new Date(formData.get('startedDate') as string);
			const endedDate = formData.get('endedDate')
				? new Date(formData.get('endedDate') as string)
				: null;

			if (!catId || !hostId) {
				throw new PlacementError('catId et hostId sont requis', 'INVALID_DATES');
			}

			validateDates(startedDate, endedDate || undefined);

			// Vérifier les chevauchements
			const existingPlacements = await prisma.placement.findMany({
				where: {
					catId,
					status: { not: 'CLOSED' }
				}
			});

			const hasOverlap = existingPlacements.some((p) => {
				if (p.endedDate && startedDate >= p.endedDate) return false;
				if (endedDate && p.startedDate >= endedDate) return false;
				return true;
			});

			if (hasOverlap) {
				throw new OverlapError('Un placement chevauche cette période');
			}

			const newPlacement = await prisma.placement.create({
				data: {
					catId,
					hostId,
					startedDate,
					endedDate,
					type: 'SHORT',
					status: 'ACTIVE',
					notes: (formData.get('notes') as string) || ''
				},
				include: {
					host: true,
					cat: true
				}
			});

			return { success: true, placement: newPlacement };
		} catch (err) {
			if (err instanceof PlacementError) {
				return fail(err.statusCode, { message: err.message });
			}
			console.error('Erreur addShortPlacement:', err);
			return fail(500, { message: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION 3: Modifier FA SHORT
	// ==========================================
	updateShortPlacement: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const placementId = formData.get('placementId') as string;
			const hostId = formData.get('hostId') as string;
			const startedDate = new Date(formData.get('startedDate') as string);
			const endedDate = formData.get('endedDate')
				? new Date(formData.get('endedDate') as string)
				: null;

			if (!placementId) {
				throw new PlacementError('placementId est requis', 'INVALID_DATES');
			}

			// Vérifier que le placement existe
			const existingPlacement = await prisma.placement.findUnique({
				where: { id: placementId }
			});

			if (!existingPlacement) {
				throw new NotFoundError('Placement non trouvé');
			}

			if (existingPlacement.type !== 'SHORT') {
				throw new InvalidStateError('Seuls les placements SHORT peuvent être modifiés');
			}

			validateDates(startedDate, endedDate || undefined);

			// Vérifier les chevauchements (sauf avec lui-même)
			const otherPlacements = await prisma.placement.findMany({
				where: {
					catId: existingPlacement.catId,
					id: { not: placementId },
					status: { not: 'CLOSED' }
				}
			});

			const hasOverlap = otherPlacements.some((p) => {
				if (p.endedDate && startedDate >= p.endedDate) return false;
				if (endedDate && p.startedDate >= endedDate) return false;
				return true;
			});

			if (hasOverlap) {
				throw new OverlapError('Un placement chevauche cette période');
			}

			const updatedPlacement = await prisma.placement.update({
				where: { id: placementId },
				data: {
					hostId,
					startedDate,
					endedDate,
					notes: (formData.get('notes') as string) || ''
				},
				include: {
					host: true,
					cat: true
				}
			});

			return { success: true, placement: updatedPlacement };
		} catch (err) {
			if (err instanceof PlacementError) {
				return fail(err.statusCode, { message: err.message });
			}
			console.error('Erreur updateShortPlacement:', err);
			return fail(500, { message: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION 4: Supprimer FA SHORT
	// ==========================================
	deleteShortPlacement: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const placementId = formData.get('placementId') as string;

			if (!placementId) {
				throw new PlacementError('placementId est requis', 'INVALID_DATES');
			}

			const existingPlacement = await prisma.placement.findUnique({
				where: { id: placementId }
			});

			if (!existingPlacement) {
				throw new NotFoundError('Placement non trouvé');
			}

			if (existingPlacement.type !== 'SHORT') {
				throw new InvalidStateError('Seuls les placements SHORT peuvent être supprimés');
			}

			await prisma.placement.delete({
				where: { id: placementId }
			});

			return { success: true };
		} catch (err) {
			if (err instanceof PlacementError) {
				return fail(err.statusCode, { message: err.message });
			}
			console.error('Erreur deleteShortPlacement:', err);
			return fail(500, { message: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION 5: Clôturer une FA
	// ==========================================
	closePlacement: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const placementId = formData.get('placementId') as string;
			const endedDate = formData.get('endedDate')
				? new Date(formData.get('endedDate') as string)
				: new Date();

			if (!placementId) {
				throw new PlacementError('placementId est requis', 'INVALID_DATES');
			}

			const existingPlacement = await prisma.placement.findUnique({
				where: { id: placementId }
			});

			if (!existingPlacement) {
				throw new NotFoundError('Placement non trouvé');
			}

			if (existingPlacement.status === 'CLOSED') {
				throw new InvalidStateError('Ce placement est déjà clôturé');
			}

			const closedPlacement = await prisma.placement.update({
				where: { id: placementId },
				data: {
					status: 'CLOSED',
					endedDate
				},
				include: {
					host: true,
					cat: true
				}
			});

			return { success: true, placement: closedPlacement };
		} catch (err) {
			if (err instanceof PlacementError) {
				return fail(err.statusCode, { message: err.message });
			}
			console.error('Erreur closePlacement:', err);
			return fail(500, { message: 'Erreur serveur' });
		}
	},

	// ==========================================
	// ACTION 6: Récupérer placements d'un chat
	// ==========================================
	getCatPlacements: async ({ request, locals }) => {
		try {
			const formData = await request.formData();
			const catId = formData.get('catId') as string;
			const includeArchived = formData.get('includeArchived') === 'true';

			if (!catId) {
				throw new PlacementError('catId est requis', 'INVALID_DATES');
			}

			const placements = await prisma.placement.findMany({
				where: {
					catId,
					...(includeArchived ? {} : { status: { not: 'CLOSED' } })
				},
				include: {
					host: true,
					cat: true
				},
				orderBy: [{ startedDate: 'desc' }]
			});

			if (placements.length === 0) {
				throw new NotFoundError('Aucun placement trouvé pour ce chat');
			}

			return { success: true, placements };
		} catch (err) {
			if (err instanceof PlacementError) {
				return fail(err.statusCode, { message: err.message });
			}
			console.error('Erreur getCatPlacements:', err);
			return fail(500, { message: 'Erreur serveur' });
		}
	}
};
