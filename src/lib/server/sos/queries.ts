import prisma from '#lib/server/prisma.ts';
import type { Prisma } from '@prisma/client';
import type { AppUser } from '#lib/types/user.ts';
import { canHandleSos, canSeeReporter, canTakeSos } from '#lib/server/permissions/sos.ts';

const sosSelect = {
	id: true,
	reportedAt: true,
	source: true,
	status: true,
	category: true,
	reporterFirstName: true,
	reporterLastName: true,
	reporterPhone: true,
	reporterEmail: true,
	address: true,
	city: true,
	postalCode: true,
	district: true,
	latitude: true,
	longitude: true,
	description: true,
	handledById: true,
	handledAt: true,
	closedAt: true,
	dismissReason: true,
	dismissNote: true,
	handledBy: { select: { profil: { select: { firstName: true, lastName: true } } } },
	// Les bénévoles en renfort
	helpers: {
		orderBy: { createdAt: 'asc' as const },
		select: {
			volunteerId: true,
			volunteer: { select: { profil: { select: { firstName: true, lastName: true } } } }
		}
	},
	cats: {
		select: { id: true, name: true, catNumber: true, status: true },
		orderBy: { createdAt: 'asc' as const }
	}
} satisfies Prisma.SosSelect;

type SosRow = Prisma.SosGetPayload<{ select: typeof sosSelect }>;

/**
 * Ce que la page reçoit d'un SOS : le contact retiré si l'utilisatrice n'a pas le droit de le voir
 * (retiré ICI, côté serveur : il n'arrive jamais dans le navigateur), et ses droits calculés.
 */
function toView(sos: SosRow, user: AppUser) {
	const { handledBy, helpers, ...rest } = sos;
	const rights = { ...rest, helperIds: helpers.map((helper) => helper.volunteerId) };
	const showReporter = canSeeReporter(user, rights);
	return {
		...rest,
		helperIds: rights.helperIds,
		helpers: helpers.map((helper) => ({
			id: helper.volunteerId,
			name: `${helper.volunteer.profil.firstName} ${helper.volunteer.profil.lastName}`
		})),
		reporterLastName: showReporter ? sos.reporterLastName : `${sos.reporterLastName.charAt(0)}.`,
		reporterPhone: showReporter ? sos.reporterPhone : null,
		reporterEmail: showReporter ? sos.reporterEmail : null,
		handledByName: handledBy ? `${handledBy.profil.firstName} ${handledBy.profil.lastName}` : null,
		canSeeReporter: showReporter,
		canTake: canTakeSos(user, rights),
		canHandle: canHandleSos(user, rights)
	};
}

export type SosView = ReturnType<typeof toView>;

/** La page SOS : tous les SOS, les plus récents en haut */
export async function listSos(user: AppUser) {
	const rows = await prisma.sos.findMany({
		select: sosSelect,
		orderBy: { reportedAt: 'desc' }
	});
	return rows.map((row) => toView(row, user));
}

/** Les SOS des chats de la page Chats (carte « Signalement »), en une requête, par id */
export async function sosViewsByIds(ids: string[], user: AppUser) {
	const unique = [...new Set(ids)];
	if (unique.length === 0) return new Map<string, SosView>();
	const rows = await prisma.sos.findMany({ where: { id: { in: unique } }, select: sosSelect });
	return new Map(rows.map((row) => [row.id, toView(row, user)]));
}

/** La pastille du menu : les SOS que personne n'a encore pris */
export function countNewSos() {
	return prisma.sos.count({ where: { status: 'NEW' } });
}

/**
 * Les SOS auxquels on peut rattacher un chat existant (fiche du chat) : ceux que
 * l'utilisatrice traite (tous pour l'admin), sauf les « sans suite »
 */
export async function linkableSosOptions(user: AppUser) {
	const rows = await prisma.sos.findMany({
		where: {
			status: { in: ['IN_PROGRESS', 'CLOSED'] },
			...(user.role === 'ADMIN'
				? {}
				: { OR: [{ handledById: user.id }, { helpers: { some: { volunteerId: user.id } } }] })
		},
		orderBy: { reportedAt: 'desc' },
		take: 100,
		select: {
			id: true,
			reportedAt: true,
			reporterFirstName: true,
			reporterLastName: true,
			address: true,
			postalCode: true,
			city: true
		}
	});
	return rows;
}

export type LinkableSos = Awaited<ReturnType<typeof linkableSosOptions>>[number];
