import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import prisma from '#lib/server/prisma.ts';
import { resumeTaskAction, snoozeTaskAction, snoozesOf, tasksFor } from '#lib/server/tasks.ts';
import { IN_HOME_PLACEMENT, monthlySeries, myStatsFor } from '#lib/server/dashboard/myStats.ts';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	try {
		const user = locals.user;

		// Les stats ET les tâches, en parallèle
		const [stats, myStats, myTasks, mySnoozes] = await Promise.all([
			getAssociationStats(),
			// « Mes stats » : selon son rôle
			myStatsFor(user),
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
			myStats
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
				placements: { some: IN_HOME_PLACEMENT }
			}
		}),
		// Les FA actives qui accueillent au moins un chat
		prisma.host.count({ where: { actif: 'ACTIVE', placements: { some: IN_HOME_PLACEMENT } } }),
		// Les FA actives, disponibles, sans aucun chat : là où un chat peut aller
		prisma.host.count({
			where: { actif: 'ACTIVE', isAvailable: true, placements: { none: IN_HOME_PLACEMENT } }
		})
	]);

	return {
		adoptions: monthlySeries(
			adoptions.map((adoption) => adoption.createdAt),
			now
		),
		catsIn: monthlySeries(
			catsIn.map((cat) => cat.createdAt),
			now
		),
		catsInHost,
		hostsWithCat,
		availableHosts
	};
}
