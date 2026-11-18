import type { Actions, PageServerLoad } from './$types';
import { OPEN_FORM_STATUSES } from '#lib/constants/forms.ts';
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
	const currentYear = new Date().getFullYear();
	const yearStart = new Date(currentYear, 0, 1);

	const [
		adoptionsThisYear,
		catsInManagement,
		activeHostFamilies,
		activeVolunteers,
		pendingApplications
	] = await Promise.all([
		prisma.adoption.count({
			where: {
				createdAt: {
					gte: yearStart
				}
			}
		}),
		prisma.cat.count({
			where: {
				status: {
					notIn: ['ADOPTED', 'FREE']
				}
			}
		}),
		prisma.host.count({
			where: {
				actif: 'ACTIVE'
			}
		}),
		prisma.volunteer.count({
			where: {
				actif: 'ACTIVE'
			}
		}),
		prisma.form.count({
			where: {
				status: { in: OPEN_FORM_STATUSES }
			}
		})
	]);

	return {
		totalYearAdoptions: adoptionsThisYear,
		totalCatsInManagement: catsInManagement,
		totalActiveHosts: activeHostFamilies,
		totalActiveVolunteers: activeVolunteers,
		pendingApplications
	};
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
