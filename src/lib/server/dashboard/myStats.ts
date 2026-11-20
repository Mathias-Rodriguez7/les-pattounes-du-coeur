import prisma from '#lib/server/prisma.ts';
import { OPEN_FORM_STATUSES } from '#lib/constants/forms.ts';
import type { VolunteerRole } from '@prisma/client';

// =====================================================================
// « Mes stats » du dashboard : une carte par rôle.
// - VOLUNTEER (manager, et l'admin dans sa vue « Bénévole ») : ses chats, pris en gestion / adoptés
// - COMMUNICATION : les publications de l'asso, publiés / adoptés
// - ADMIN : les candidatures et l'accueil des nouvelles (FA, bénévoles)
// =====================================================================

const DAY = 24 * 60 * 60 * 1000;

/** Un chat en FA : un placement en cours (actif ou en pause) ; une simple proposition ne compte pas */
export const IN_HOME_PLACEMENT = {
	type: { not: 'PROPOSAL' as const },
	status: { in: ['ACTIVE' as const, 'BREAK' as const] }
};

/** Le nombre par mois, de janvier au mois en cours, + le mois en cours et le total de l'année */
export function monthlySeries(dates: Date[], now: Date) {
	const yearStart = new Date(now.getFullYear(), 0, 1);
	const byMonth = Array.from({ length: now.getMonth() + 1 }, () => 0);
	const inYear = dates.filter((date) => date >= yearStart && date <= now);
	for (const date of inYear) byMonth[date.getMonth()]++;
	return { byMonth, month: byMonth[now.getMonth()], year: inYear.length };
}

/** Ce qu'il faut charger selon le rôle (l'admin a les deux vues : la sienne et celle de bénévole) */
export async function myStatsFor(user: { id: string; role: VolunteerRole }) {
	const [volunteer, communication, admin] = await Promise.all([
		user.role === 'COMMUNICATION' ? null : volunteerStats(user.id),
		user.role === 'COMMUNICATION' ? communicationStats() : null,
		user.role === 'ADMIN' ? adminStats() : null
	]);
	const since = await prisma.volunteer.findUnique({
		where: { id: user.id },
		select: { createdAt: true }
	});
	return { since: since?.createdAt ?? null, volunteer, communication, admin };
}

// ---------------------------------------------------------------------
// Bénévole : ses chats
// ---------------------------------------------------------------------
async function volunteerStats(volunteerId: string) {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1);
	// La même période l'an dernier : du 1er janvier à aujourd'hui
	const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
	const lastYearSameDay = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

	// Les chats qu'elle suit ou a suivis (lien en cours ou terminé)
	const followedByHer = {
		OR: [{ volunteers: { some: { volunteerId } } }, { volunteerHistory: { some: { volunteerId } } }]
	};

	const [adoptions, links, pastLinks, myCats, formsToHandle] = await Promise.all([
		// Les adoptions de ses chats, depuis toujours (une adoption annulée ne compte pas)
		prisma.adoption.findMany({
			where: { status: { not: 'CANCELLED' }, cat: followedByHer },
			select: { createdAt: true }
		}),
		// Les chats pris en gestion cette année : ses liens en cours, et ceux déjà terminés
		prisma.catVolunteer.findMany({
			where: { volunteerId, createdAt: { gte: yearStart }, cat: { status: { not: 'FREE' } } },
			select: { createdAt: true }
		}),
		prisma.catVolunteerHistory.findMany({
			where: { volunteerId, startedAt: { gte: yearStart }, cat: { status: { not: 'FREE' } } },
			select: { startedAt: true }
		}),
		// Ses chats en ce moment : pas encore adoptés
		prisma.catVolunteer.findMany({
			where: { volunteerId, cat: { status: { in: ['AVAILABLE', 'SOCIALIZE'] } } },
			select: {
				cat: { select: { status: true, isVisible: true, publicationRequestedAt: true } }
			}
		}),
		// Les candidatures qu'on lui a confiées, encore ouvertes
		prisma.form.count({
			where: { assignedToId: volunteerId, status: { in: OPEN_FORM_STATUSES } }
		})
	]);

	const cats = myCats.map(({ cat }) => cat);
	const adoptionDates = adoptions.map((adoption) => adoption.createdAt);
	const lastYear = adoptionDates.filter(
		(date) => date >= lastYearStart && date <= lastYearSameDay
	).length;
	const adoptionsSeries = monthlySeries(adoptionDates, now);

	return {
		adoptionsTotal: adoptions.length,
		// Comparé à la même période l'an dernier
		adoptionsDelta: adoptionsSeries.year - lastYear,
		adoptions: adoptionsSeries,
		catsTaken: monthlySeries(
			[...links.map((link) => link.createdAt), ...pastLinks.map((link) => link.startedAt)],
			now
		),
		myCats: cats.length,
		visible: cats.filter((cat) => cat.isVisible).length,
		socialize: cats.filter((cat) => cat.status === 'SOCIALIZE').length,
		// Prêts, mais pas encore proposés à la publication
		toRequest: cats.filter(
			(cat) => cat.status === 'AVAILABLE' && !cat.isVisible && !cat.publicationRequestedAt
		).length,
		formsToHandle
	};
}

// ---------------------------------------------------------------------
// Communication : les publications (de toute l'asso : la base ne dit pas qui a publié)
// ---------------------------------------------------------------------
async function communicationStats() {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1);
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const twoMonthsAgo = new Date(now.getTime() - 60 * DAY);
	const online = { isVisible: true, status: { in: ['AVAILABLE' as const, 'SOCIALIZE' as const] } };

	const [published, adoptedAfterPublication, toPublish, onlineCount, stale, news] =
		await Promise.all([
			// Les chats publiés cette année, et s'ils ont été adoptés depuis
			prisma.cat.findMany({
				where: { publishedAt: { gte: yearStart } },
				select: {
					publishedAt: true,
					adoptions: { where: { status: { not: 'CANCELLED' } }, select: { id: true }, take: 1 }
				}
			}),
			// Les adoptions de l'année d'un chat qui avait été publié
			prisma.adoption.findMany({
				where: {
					createdAt: { gte: yearStart },
					status: { not: 'CANCELLED' },
					cat: { publishedAt: { not: null } }
				},
				select: { createdAt: true }
			}),
			// Les demandes de publication à valider
			prisma.cat.count({
				where: {
					publicationRequestedAt: { not: null },
					status: { notIn: ['ADOPTED', 'FREE'] }
				}
			}),
			prisma.cat.count({ where: online }),
			// En ligne depuis plus de 2 mois, sans aucune candidature : à remettre en avant
			prisma.cat.count({
				where: { ...online, publishedAt: { lt: twoMonthsAgo }, forms: { none: {} } }
			}),
			prisma.news.count({ where: { createdAt: { gte: monthStart } } })
		]);

	return {
		published: monthlySeries(
			published.flatMap((cat) => (cat.publishedAt ? [cat.publishedAt] : [])),
			now
		),
		publishedAdopted: published.filter((cat) => cat.adoptions.length > 0).length,
		adoptions: monthlySeries(
			adoptedAfterPublication.map((adoption) => adoption.createdAt),
			now
		),
		toPublish,
		online: onlineCount,
		stale,
		news
	};
}

// ---------------------------------------------------------------------
// Admin : les candidatures et l'accueil des nouvelles
// ---------------------------------------------------------------------
async function adminStats() {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1);

	const [received, processed, newHosts, newVolunteers, unassigned, invitations] = await Promise.all(
		[
			prisma.form.findMany({
				where: { createdAt: { gte: yearStart } },
				select: { createdAt: true }
			}),
			// Traitées : approuvées ou refusées (la date de la décision = la dernière modification)
			prisma.form.findMany({
				where: { status: { in: ['APPROVED', 'REJECTED'] }, updatedAt: { gte: yearStart } },
				select: { createdAt: true, updatedAt: true }
			}),
			prisma.host.count({ where: { createdAt: { gte: yearStart } } }),
			prisma.volunteer.count({ where: { createdAt: { gte: yearStart } } }),
			// Ouvertes, et personne ne s'en occupe
			prisma.form.count({
				where: {
					status: { in: OPEN_FORM_STATUSES },
					assignedToId: null,
					assignees: { none: {} }
				}
			}),
			// Envoyées, pas encore acceptées (une invitation acceptée est supprimée)
			prisma.invitation.count({ where: { expiresAt: { gt: now } } })
		]
	);

	const delays = processed.map((form) => form.updatedAt.getTime() - form.createdAt.getTime());
	const averageDays =
		delays.length === 0
			? null
			: Math.round(delays.reduce((sum, delay) => sum + delay, 0) / delays.length / DAY);

	return {
		newHosts,
		newVolunteers,
		received: monthlySeries(
			received.map((form) => form.createdAt),
			now
		),
		processed: monthlySeries(
			processed.map((form) => form.updatedAt),
			now
		),
		unassigned,
		invitations,
		averageDays
	};
}
