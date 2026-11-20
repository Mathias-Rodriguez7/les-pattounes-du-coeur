import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import prisma from '#lib/server/prisma.ts';
import { resumeTaskAction, snoozeTaskAction, snoozesOf, tasksFor } from '#lib/server/tasks.ts';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	try {
		const user = locals.user;

		// Les stats ET les tâches, en parallèle
		const [stats, volunteerStats, myTasks, mySnoozes] = await Promise.all([
			getAssociationStats(),
			getVolunteerStats(user.id),
			// « À faire » : ce qu'il y a à faire, calculé à partir des données
			tasksFor(user),
			// Ce qu'elle a mis de côté (« Plus tard »)
			snoozesOf(user.id)
		]);

		return {
			user,
			myTasks,
			mySnoozes,
			stats,
			volunteerStats
		};
	} catch (err) {
		console.error('Dashboard load error:', err);
		error(500, 'Erreur lors du chargement du dashboard');
	}
};

// « Plus tard » : mettre une tâche de côté pour soi, ou la reprendre
export const actions: Actions = {
	snoozeTask: snoozeTaskAction,
	resumeTask: resumeTaskAction
};

// ============================================
// STATS - ASSOCIATION (same for all roles)
// ============================================

async function getAssociationStats() {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1);

	// Un chat en FA : un placement en cours (actif ou en pause) ; une simple proposition ne compte pas
	const inHomePlacement = {
		type: { not: 'PROPOSAL' as const },
		status: { in: ['ACTIVE' as const, 'BREAK' as const] }
	};

	const [adoptions, catsIn, catsInHost, hostsWithCat, availableHosts] = await Promise.all([
		// Les adoptions de l'année (une adoption annulée, chat revenu, ne compte pas)
		prisma.adoption.findMany({
			where: { createdAt: { gte: yearStart }, status: { not: 'CANCELLED' } },
			select: { createdAt: true }
		}),
		// Les chats entrés à l'association cette année (les chats libres n'en font pas partie)
		prisma.cat.findMany({
			where: { createdAt: { gte: yearStart }, status: { not: 'FREE' } },
			select: { createdAt: true }
		}),
		// Les chats en FA en ce moment (un chat en transfert dans deux FA compte une fois)
		prisma.cat.count({
			where: {
				status: { in: ['AVAILABLE', 'SOCIALIZE'] },
				placements: { some: inHomePlacement }
			}
		}),
		// Les FA actives qui accueillent au moins un chat
		prisma.host.count({ where: { actif: 'ACTIVE', placements: { some: inHomePlacement } } }),
		// Les FA actives, disponibles, sans aucun chat : là où un chat peut aller
		prisma.host.count({
			where: { actif: 'ACTIVE', isAvailable: true, placements: { none: inHomePlacement } }
		})
	]);

	return {
		adoptions: monthlySeries(adoptions, now),
		catsIn: monthlySeries(catsIn, now),
		catsInHost,
		hostsWithCat,
		availableHosts
	};
}

/** Le nombre par mois, de janvier au mois en cours, + le mois en cours et le total de l'année */
function monthlySeries(rows: { createdAt: Date }[], now: Date) {
	const byMonth = Array.from({ length: now.getMonth() + 1 }, () => 0);
	for (const row of rows) byMonth[row.createdAt.getMonth()]++;
	return { byMonth, month: byMonth[now.getMonth()], year: rows.length };
}

// ============================================
// VOLUNTEER STATS
// ============================================

async function getVolunteerStats(volunteerId: string) {
	const currentYear = new Date().getFullYear();
	const yearStart = new Date(currentYear, 0, 1);

	const [
		totalCatsInAssociation,
		totalCatsManagedByVolunteer,
		totalAdoptionsThisYear,
		adoptionsThisYearByVolunteer,
		totalApplicationsThisYear,
		applicationsAssignedToVolunteerNonPending
	] = await Promise.all([
		// 1️⃣ TOTAL CHATS DANS L'ASSO (les chats libres ne sont pas des chats de l'asso)
		prisma.cat.count({ where: { status: { not: 'FREE' } } }),

		// 1️⃣ TOTAL CHATS GÉRÉS PAR LE BÉNÉVOLE
		prisma.catVolunteer.count({ where: { volunteerId, cat: { status: { not: 'FREE' } } } }),

		// 2️⃣ TOTAL ADOPTIONS CETTE ANNÉE DANS L'ASSO
		prisma.adoption.count({
			where: {
				createdAt: {
					gte: yearStart
				}
			}
		}),

		// 2️⃣ ADOPTIONS CETTE ANNÉE PAR LE BÉNÉVOLE
		prisma.adoption.count({
			where: {
				cat: { volunteers: { some: { volunteerId } } },
				createdAt: { gte: yearStart }
			}
		}),

		// 3️⃣ TOTAL CANDIDATURES CETTE ANNÉE
		prisma.form.count({
			where: {
				createdAt: {
					gte: yearStart
				}
			}
		}),

		// 3️⃣ CANDIDATURES ASSIGNÉES AU BÉNÉVOLE (TRAITÉES : approuvées ou rejetées)
		prisma.form.count({
			where: {
				assignedToId: volunteerId,
				status: { in: ['APPROVED', 'REJECTED'] },
				createdAt: {
					gte: yearStart
				}
			}
		})
	]);

	return {
		// Stats pour les radial charts
		catsManaged: {
			volunteerValue: totalCatsManagedByVolunteer,
			totalValue: totalCatsInAssociation
		},
		adoptionsThisYear: {
			volunteerValue: adoptionsThisYearByVolunteer,
			totalValue: totalAdoptionsThisYear
		},
		applicationsProcessed: {
			volunteerValue: applicationsAssignedToVolunteerNonPending,
			totalValue: totalApplicationsThisYear
		}
	};
}
