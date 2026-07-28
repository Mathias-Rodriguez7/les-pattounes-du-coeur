import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	try {
		const user = locals.user;
		const userRole = user.role;

		// Récupérer les stats ET les tâches en parallèle
		const [stats, taskData] = await Promise.all([
			getAssociationStats(),
			getTasksByRole(userRole, user.id)
		]);

		const adminQuickActions = [
			{
				label: 'Créer un chat',
				description: 'Ajouter un nouveau chat',
				icon: 'cat',
				iconTheme: 'cats',
				href: '/dashboard/chat'
			},
			{
				label: 'Créer une FA',
				description: "Ajouter une famille d'accueil",
				icon: 'house',
				iconTheme: 'fa',
				href: '/dashboard/fa'
			},
			{
				label: 'Créer un bénévole',
				description: 'Inviter un nouveau bénévole',
				icon: 'users',
				iconTheme: 'volunteers',
				href: '/dashboard/benevole'
			},
			{
				label: 'Candidatures',
				description: 'Traiter les nouvelles candidatures',
				icon: 'mail',
				iconTheme: 'pending',
				href: '/dashboard/candidature'
			}
		];

		const managerQuickActions = [
			{
				label: 'Créer un chat',
				description: 'Ajouter un nouveau chat',
				icon: 'cat',
				iconTheme: 'cats',
				href: '/cats/new'
			},
			{
				label: 'Candidatures',
				description: 'Traiter mes candidatures',
				icon: 'mail',
				iconTheme: 'pending',
				href: '/applications?assigned=me'
			}
		];

		const communicationQuickActions = [
			{
				label: 'Créer un chat',
				description: 'Ajouter un nouveau chat',
				icon: 'cat',
				iconTheme: 'cats',
				href: '/cats/new'
			},
			{
				label: 'Créer une News',
				description: 'Ajouter une News',
				icon: 'pen',
				iconTheme: 'news',
				href: '/dashboard/news/new'
			},
			{
				label: 'Candidatures',
				description: 'Traiter mes candidatures',
				icon: 'mail',
				iconTheme: 'pending',
				href: '/applications?assigned=me'
			}
		];

		return {
			user,
			stats,
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
				created_at: {
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
		pendingApplications: pendingApplications
	};
}

// ============================================
// TASKS - ADMIN
// ============================================

async function getAdminTasks(volunteerId: string) {
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
				placements: { none: { ended: null } }
			}
		}),
		// 2. FA - FA actives sans chat
		prisma.placement.count({
			where: {
				host: {
					actif: 'ACTIVE'
				},
				catId: undefined
			}
		}),
		// 3. FA - FA en pause
		prisma.host.count({
			where: {
				actif: { not: 'ACTIVE' }
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
					href: '/dashboard/chats'
				}
			]
		},
		{
			theme: 'FA',
			icon: 'house',
			iconTheme: 'fa',
			tasks: [
				{
					label: 'Actives sans chat',
					description: 'À assigner',
					value: activeHostsWithoutCat,
					href: '/dashboard/fa'
				},
				{
					label: 'En pause',
					description: 'À réactiver',
					value: inactiveHosts,
					href: '/dashboard/fa?filter=inactive'
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
					href: '/dashboard/benevoles'
				},
				{
					label: 'En pause',
					description: 'À réactiver',
					value: pausedVolunteers,
					href: '/dashboard/benevoles?filter=inactive'
				}
			]
		},
		{
			theme: 'Candidatures',
			icon: 'mail',
			iconTheme: 'pending',
			tasks: [
				{
					label: 'Pour devenir FA',
					description: 'À traiter',
					value: pendingHostForms,
					href: '/dashboard/candidatures?type=HOST'
				},
				{
					label: 'Pour devenir bénévole',
					description: 'À traiter',
					value: pendingVolunteerForms,
					href: '/dashboard/candidatures?type=VOLUNTEER'
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
			prisma.catVolunteer.count({
				where: {
					volunteerId: volunteerId
				}
			}),

			// 2️⃣ FICHES DE CHATS INCOMPLÈTES
			// CHATS - Fiches incomplètes assignées À CE BÉNÉVOLE
			prisma.cat.count({
				where: {
					volunteers: {
						some: {
							volunteerId: volunteerId
						}
					},
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
					href: '/dashboard/mes-chats'
				},
				{
					label: 'Fiches incomplètes',
					description: 'À compléter',
					value: incompleteCats,
					href: '/dashboard/mes-chats?filter=incomplete'
				}
			]
		},
		{
			theme: 'Mes candidatures',
			icon: 'mail',
			iconTheme: 'pending',
			tasks: [
				{
					label: 'Candidatures bénévoles',
					description: 'En attente de traitement',
					value: assignedPendingVolunteerForms,
					href: '/dashboard/candidatures?assigned=true'
				},
				{
					label: 'Candidatures FA',
					description: 'En attente de traitement',
					value: assignedPendingHostForms,
					href: '/dashboard/candidatures?assigned=true&type=HOST'
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
		prisma.catVolunteer.count({
			where: {
				volunteerId: volunteerId
			}
		}),

		// 2️⃣ FICHES DE CHATS INCOMPLÈTES
		prisma.cat.count({
			where: {
				volunteers: {
					some: {
						volunteerId: volunteerId
					}
				},
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
				created_at: {
					gte: firstDayOfMonth
				}
			}
		}),

		// 6️⃣ NEWSLETTERS CRÉÉES CE MOIS
		prisma.news.count({
			where: {
				type: 'NEWSLETTER',
				created_at: {
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
					href: '/dashboard/mes-chats'
				},
				{
					label: 'Fiches incomplètes',
					description: 'À compléter',
					value: incompleteCats,
					href: '/dashboard/mes-chats?filter=incomplete'
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
					href: '/dashboard/news?type=NEWS'
				},
				{
					label: 'Newsletters',
					description: 'Créées ce mois-ci',
					value: newslettersThisMonth,
					href: '/dashboard/news?type=NEWSLETTER'
				}
			]
		},
		{
			theme: 'Mes candidatures',
			icon: 'mail',
			iconTheme: 'pending',
			tasks: [
				{
					label: 'Candidatures bénévoles',
					description: 'En attente de traitement',
					value: assignedPendingVolunteerForms,
					href: '/dashboard/candidatures?assigned=true'
				},
				{
					label: 'Candidatures FA',
					description: 'En attente de traitement',
					value: assignedPendingHostForms,
					href: '/dashboard/candidatures?assigned=true&type=HOST'
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
			adminTasks: await getAdminTasks(volunteerId),
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
