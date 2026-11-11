import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { Path } from '$app/types';

/**
 * Un lien du dashboard : uniquement une route qui EXISTE (TypeScript le vérifie).
 * Avant, beaucoup de liens menaient à des pages inexistantes (/dashboard/fa, /dashboard/formulaire…).
 */
const link = (path: Path): Path => path;

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	try {
		const user = locals.user;
		const userRole = user.role;

		// Récupérer les stats ET les tâches en parallèle
		const [stats, taskData, volunteerStats] = await Promise.all([
			getAssociationStats(),
			getTasksByRole(userRole, user.id),
			getVolunteerStats(user.id)
		]);

		const adminQuickActions = [
			{
				label: 'Chat',
				description: 'Ajouter un chat',
				icon: 'cat',
				iconTheme: 'cats',
				href: link('/dashboard/chat')
			},
			{
				label: 'Famille d’accueil',
				description: 'Ajouter une FA',
				icon: 'house',
				iconTheme: 'fa',
				href: link('/dashboard/famille_d_accueil')
			},
			{
				label: 'Bénévole',
				description: 'Ajouter un bénévole',
				icon: 'users',
				iconTheme: 'volunteers',
				href: link('/dashboard/benevole')
			},
			{
				label: 'Formulaires',
				description: 'Traiter les formulaires',
				icon: 'clipboard',
				iconTheme: 'pending',
				href: link('/dashboard/forms')
			}
		];

		const managerQuickActions = [
			{
				label: 'Chat',
				description: 'Ajouter un chat',
				icon: 'cat',
				iconTheme: 'cats',
				href: link('/dashboard/chat')
			},
			{
				label: 'Formulaires',
				description: 'Traiter mes formulaires',
				icon: 'clipboard',
				iconTheme: 'pending',
				href: link('/dashboard/forms')
			}
		];

		const communicationQuickActions = [
			{
				label: 'Chat',
				description: 'Ajouter un chat',
				icon: 'cat',
				iconTheme: 'cats',
				href: link('/dashboard/chat')
			},
			{
				label: 'News',
				description: 'Ajouter une News',
				icon: 'pen',
				iconTheme: 'news',
				href: link('/dashboard/news')
			},
			{
				label: 'Formulaires',
				description: 'Traiter mes formulaires',
				icon: 'clipboard',
				iconTheme: 'pending',
				href: link('/dashboard/forms')
			}
		];

		return {
			user,
			stats,
			volunteerStats,
			adminQuickActions,
			managerQuickActions,
			communicationQuickActions,
			...taskData
		};
	} catch (err) {
		console.error('Dashboard load error:', err);
		error(500, 'Erreur lors du chargement du dashboard');
	}
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
				status: 'PENDING'
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
// TASKS - ADMIN
// ============================================

async function getAdminTasks() {
	const [
		catsWithoutFA,
		activeHostsWithoutCat,
		inactiveHosts,
		activeVolunteersWithoutCat,
		pausedVolunteers,
		pendingHostForms,
		pendingVolunteerForms
	] = await Promise.all([
		// 1. CHATS - Chats sans FA
		prisma.cat.count({
			where: {
				status: { in: ['AVAILABLE', 'SOCIALIZE'] },
				placements: { none: { endDate: null } }
			}
		}),
		// 2. FA - FA actives sans chat
		prisma.host.count({
			where: {
				actif: 'ACTIVE',
				placements: {
					some: {
						catId: undefined
					}
				}
			}
		}),
		// 3. FA - FA en pause
		prisma.host.count({
			where: {
				actif: 'BREAK'
			}
		}),
		// 4. BÉNÉVOLE - Bénévoles actifs sans chat
		prisma.volunteer.count({
			where: {
				actif: 'ACTIVE',
				cats: {
					none: {}
				}
			}
		}),
		// 5. BÉNÉVOLE - Bénévoles en pause ou arrêtés
		prisma.volunteer.count({
			where: {
				actif: { not: 'ACTIVE' }
			}
		}),
		// 6. CANDIDATURE - Candidatures pour devenir FA
		prisma.form.count({
			where: {
				type: 'HOST',
				status: 'PENDING'
			}
		}),
		// 7. CANDIDATURE - Candidatures pour devenir bénévole
		prisma.form.count({
			where: {
				type: 'VOLUNTEER',
				status: 'PENDING'
			}
		})
	]);

	return [
		{
			theme: 'Chats',
			icon: 'cat',
			iconTheme: 'cats',
			tasks: [
				{
					label: 'Chat sans FA',
					description: 'À placer',
					value: catsWithoutFA,
					href: link('/dashboard/chat')
				}
			]
		},
		{
			theme: 'Familles d’accueil',
			icon: 'house',
			iconTheme: 'fa',
			tasks: [
				{
					label: 'Actives sans chat',
					description: 'À assigner',
					value: activeHostsWithoutCat,
					href: link('/dashboard/famille_d_accueil')
				},
				{
					label: 'En pause',
					description: 'À réactiver',
					value: inactiveHosts,
					href: link('/dashboard/famille_d_accueil')
				}
			]
		},
		{
			theme: 'Bénévoles',
			icon: 'users',
			iconTheme: 'volunteers',
			tasks: [
				{
					label: 'Actifs sans chat',
					description: 'À assigner',
					value: activeVolunteersWithoutCat,
					href: link('/dashboard/benevole')
				},
				{
					label: 'En pause',
					description: 'À réactiver',
					value: pausedVolunteers,
					href: link('/dashboard/benevole')
				}
			]
		},
		{
			theme: 'Formulaires',
			icon: 'clipboard',
			iconTheme: 'pending',
			tasks: [
				{
					label: 'FA',
					description: 'À traiter',
					value: pendingHostForms,
					href: link('/dashboard/forms')
				},
				{
					label: 'Bénévoles',
					description: 'À traiter',
					value: pendingVolunteerForms,
					href: link('/dashboard/forms')
				}
			]
		}
	];
}

// ============================================
// TASKS - MANAGER
// ============================================

async function getManagerTasks(volunteerId: string) {
	const [totalCats, incompleteCats, assignedPendingVolunteerForms, assignedPendingHostForms] =
		await Promise.all([
			// 1️⃣ TOTAL DE CHATS EN GESTION
			// Compte tous les chats assignés à ce bénévole
			prisma.catVolunteer.count({ where: { volunteerId } }),

			// 2️⃣ FICHES DE CHATS INCOMPLÈTES
			// CHATS - Fiches incomplètes assignées À CE BÉNÉVOLE
			prisma.cat.count({
				where: {
					volunteers: { some: { volunteerId } },
					OR: [
						{ name: null },
						{ birthDate: null },
						{ color: null },
						{ isSterilize: false },
						{ vaccinate: null },
						{ isFivTest: false },
						{ isDeworming: false },
						{ description: null },
						{ isOkCat: null },
						{ isOkDog: null },
						{ isOkChild: null },
						{ isOutside: null },
						{ isIdentify: false },
						{ chipId: null }
					]
				}
			}),

			// 3️⃣ CANDIDATURES ASSIGNÉES ET EN ATTENTE
			// Compte les formulaires en pending assignés spécifiquement à ce manager
			prisma.form.count({
				where: {
					type: 'VOLUNTEER',
					status: 'PENDING',
					assignedToId: volunteerId
				}
			}),
			prisma.form.count({
				where: {
					type: 'HOST',
					status: 'PENDING',
					assignedToId: volunteerId
				}
			})
		]);

	return [
		{
			theme: 'Mes Chats',
			icon: 'cat',
			iconTheme: 'cats',
			tasks: [
				{
					label: 'Chats en gestion',
					description: 'Total suivi',
					value: totalCats,
					href: link('/dashboard/chat')
				},
				{
					label: 'Fiches incomplètes',
					description: 'À compléter',
					value: incompleteCats,
					href: link('/dashboard/chat')
				}
			]
		},
		{
			theme: 'Mes formulaires',
			icon: 'clipboard',
			iconTheme: 'pending',
			tasks: [
				{
					label: 'Formulaires bénévoles',
					description: 'En attente de traitement',
					value: assignedPendingVolunteerForms,
					href: link('/dashboard/forms')
				},
				{
					label: 'Formulaires FA',
					description: 'En attente de traitement',
					value: assignedPendingHostForms,
					href: link('/dashboard/forms')
				}
			]
		}
	];
}

// ============================================
// TASKS - COMMUNICATION
// ============================================

async function getCommunicationTasks(volunteerId: string) {
	const now = new Date();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		totalCats,
		incompleteCats,
		assignedPendingVolunteerForms,
		assignedPendingHostForms,
		newsThisMonth,
		newslettersThisMonth
	] = await Promise.all([
		// 1️⃣ TOTAL DE CHATS EN GESTION
		prisma.catVolunteer.count({ where: { volunteerId } }),

		// 2️⃣ FICHES DE CHATS INCOMPLÈTES
		prisma.cat.count({
			where: {
				volunteers: { some: { volunteerId } },
				OR: [
					{ name: null },
					{ birthDate: null },
					{ color: null },
					{ isSterilize: false },
					{ vaccinate: null },
					{ isFivTest: false },
					{ isDeworming: false },
					{ description: null },
					{ isOkCat: null },
					{ isOkDog: null },
					{ isOkChild: null },
					{ isOutside: null },
					{ isIdentify: false },
					{ chipId: null }
				]
			}
		}),

		// 3️⃣ CANDIDATURES BÉNÉVOLES EN ATTENTE
		prisma.form.count({
			where: {
				type: 'VOLUNTEER',
				status: 'PENDING',
				assignedToId: volunteerId
			}
		}),

		// 4️⃣ CANDIDATURES FA EN ATTENTE
		prisma.form.count({
			where: {
				type: 'HOST',
				status: 'PENDING',
				assignedToId: volunteerId
			}
		}),

		// 5️⃣ NEWS CRÉÉES CE MOIS
		prisma.news.count({
			where: {
				type: 'NEWS',
				createdAt: {
					gte: firstDayOfMonth
				}
			}
		}),

		// 6️⃣ NEWSLETTERS CRÉÉES CE MOIS
		prisma.news.count({
			where: {
				type: 'NEWSLETTER',
				createdAt: {
					gte: firstDayOfMonth
				}
			}
		})
	]);

	return [
		{
			theme: 'Mes Chats',
			icon: 'cat',
			iconTheme: 'cats',
			tasks: [
				{
					label: 'Chats en gestion',
					description: 'Total suivi',
					value: totalCats,
					href: link('/dashboard/chat')
				},
				{
					label: 'Fiches incomplètes',
					description: 'À compléter',
					value: incompleteCats,
					href: link('/dashboard/chat')
				}
			]
		},
		{
			theme: 'News',
			icon: 'pen',
			iconTheme: 'news',
			tasks: [
				{
					label: 'News ce mois',
					description: 'Créées ce mois-ci',
					value: newsThisMonth,
					href: link('/dashboard/news')
				},
				{
					label: 'Newsletters',
					description: 'Créées ce mois-ci',
					value: newslettersThisMonth,
					href: link('/dashboard/news')
				}
			]
		},
		{
			theme: 'Mes formulaires',
			icon: 'clipboard',
			iconTheme: 'pending',
			tasks: [
				{
					label: 'Formulaires bénévoles',
					description: 'En attente de traitement',
					value: assignedPendingVolunteerForms,
					href: link('/dashboard/forms')
				},
				{
					label: 'Formulaires FA',
					description: 'En attente de traitement',
					value: assignedPendingHostForms,
					href: link('/dashboard/forms')
				}
			]
		}
	];
}

// ============================================
// TASKS - DISPATCHER (common for all roles)
// ============================================

async function getTasksByRole(role: string, volunteerId: string) {
	if (role === 'ADMIN') {
		return {
			// Les tâches admin concernent toute l'association : pas de volunteerId
			adminTasks: await getAdminTasks(),
			managerTasks: await getManagerTasks(volunteerId)
		};
	} else if (role === 'MANAGER') {
		return {
			managerTasks: await getManagerTasks(volunteerId)
		};
	} else if (role === 'COMMUNICATION') {
		return {
			communicationTasks: await getCommunicationTasks(volunteerId)
		};
	}
	return {};
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
		// 1️⃣ TOTAL CHATS DANS L'ASSO
		prisma.cat.count({}),

		// 1️⃣ TOTAL CHATS GÉRÉS PAR LE BÉNÉVOLE
		prisma.catVolunteer.count({ where: { volunteerId } }),

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

		// 3️⃣ CANDIDATURES ASSIGNÉES AU BÉNÉVOLE (NON PENDING)
		prisma.form.count({
			where: {
				assignedToId: volunteerId,
				status: {
					not: 'PENDING'
				},
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
