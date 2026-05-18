import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

type DashboardTask = {
	label: string;
	value: number;
	description: string;
	icon: string;
};

type QuickAction = {
	label: string;
	description: string;
	href: string;
	icon: string;
};

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return {
			user: null
		};
	}

	/*
	|--------------------------------------------------------------------------
	| USER COMPLET
	|--------------------------------------------------------------------------
	*/

	const volunteer = await prisma.volunteer.findUnique({
		where: {
			id: user.id
		},
		include: {
			profil: true,
			cats: {
				include: {
					cat: {
						include: {
							placements: {
								include: {
									host: true
								}
							},
							adoptions: true
						}
					}
				}
			}
		}
	});

	if (!volunteer) {
		return {
			user: null
		};
	}

	/*
	|--------------------------------------------------------------------------
	| STATS PERSONNELLES
	|--------------------------------------------------------------------------
	*/

	const volunteerCats = volunteer.cats.length;

	const hostIds = new Set<string>();

	volunteer.cats.forEach((relation) => {
		relation.cat.placements.forEach((placement) => {
			hostIds.add(placement.hostId);
		});
	});

	const volunteerHosts = hostIds.size;

	const volunteerAdoptions = volunteer.cats.filter(
		(relation) => relation.cat.adoptions.length > 0
	).length;

	/*
	|--------------------------------------------------------------------------
	| STATS GLOBALES
	|--------------------------------------------------------------------------
	*/

	const currentYear = new Date().getFullYear();

	const [totalAvailableCats, totalActiveHosts, totalYearAdoptions, totalVolunteers] =
		await Promise.all([
			prisma.cat.count({
				where: {
					status: 'AVAILABLE'
				}
			}),

			prisma.host.count({
				where: {
					actif: 'ACTIVE'
				}
			}),

			prisma.adoption.count({
				where: {
					created_at: {
						gte: new Date(`${currentYear}-01-01`)
					}
				}
			}),

			prisma.volunteer.count({
				where: {
					actif: 'ACTIVE'
				}
			})
		]);

	/*
	|--------------------------------------------------------------------------
	| TASKS DASHBOARD
	|--------------------------------------------------------------------------
	*/

	let dashboardTasks: DashboardTask[] = [];

	/*
	|--------------------------------------------------------------------------
	| ADMIN TASKS
	|--------------------------------------------------------------------------
	*/

	if (user.role === 'ADMIN') {
		const [findFA, createFA, treatForms] = await Promise.all([
			prisma.cat.count({
				where: {
					isVisible: false,
					status: {
						not: 'FREE'
					}
				}
			}),

			prisma.form.count({
				where: {
					type: 'HOST',
					status: 'PENDING'
				}
			}),

			prisma.form.count({
				where: {
					status: 'PENDING'
				}
			})
		]);

		dashboardTasks = [
			{
				label: 'Trouver des FA',
				value: findFA,
				description: 'Chats non visibles',
				icon: 'search'
			},

			{
				label: 'Créer des FA',
				value: createFA,
				description: 'Demandes HOST en attente',
				icon: 'plus'
			},

			{
				label: 'Traiter les candidatures',
				value: treatForms,
				description: 'Formulaires à traiter',
				icon: 'clipboard'
			}
		];

		/*
	|--------------------------------------------------------------------------
	| MANAGER / COMMUNICATION TASKS
	|--------------------------------------------------------------------------
	*/
	} else if (user.role === 'MANAGER' || user.role === 'COMMUNICATION') {
		const [completeCats, treatForms] = await Promise.all([
			prisma.catVolunteer.count({
				where: {
					volunteerId: user.id,
					cat: {
						OR: [{ name: null }, { description: null }, { chipId: null }]
					}
				}
			}),

			prisma.form.count({
				where: {
					assignedToId: user.id,
					status: 'PENDING'
				}
			})
		]);

		dashboardTasks = [
			{
				label: 'Compléter les chats',
				value: completeCats,
				description: 'Informations manquantes',
				icon: 'cat'
			},

			{
				label: 'Traiter les candidatures',
				value: treatForms,
				description: 'Formulaires assignés',
				icon: 'clipboard'
			}
		];
	}

	/*
|--------------------------------------------------------------------------
| QUICK ACTIONS
|--------------------------------------------------------------------------
*/

	let quickActions: QuickAction[] = [];

	if (user.role === 'ADMIN') {
		quickActions = [
			{
				label: 'Ajouter un chat',
				description: 'Créer un nouveau chat.',
				href: '/dashboard/cats/new',
				icon: 'cat'
			},

			{
				label: 'Ajouter une FA',
				description: 'Créer une nouvelle famille d’accueil.',
				href: '/dashboard/hosts/new',
				icon: 'house'
			},

			{
				label: 'Les candidatures',
				description: 'Consulter les formulaires.',
				href: '/dashboard/forms',
				icon: 'mail'
			},

			{
				label: 'Les bénévoles',
				description: 'Gérer les bénévoles.',
				href: '/dashboard/volunteer',
				icon: 'users'
			}
		];
	} else if (user.role === 'MANAGER') {
		quickActions = [
			{
				label: 'Ajouter un chat',
				description: 'Créer une fiche chat.',
				href: '/dashboard/cats/new',
				icon: 'cat'
			}
		];
	} else if (user.role === 'COMMUNICATION') {
		quickActions = [
			{
				label: 'Publier une news',
				description: 'Créer une actualité.',
				href: '/dashboard/news',
				icon: 'mail'
			}
		];
	}

	/*
	|--------------------------------------------------------------------------
	| DERNIERS CHATS
	|--------------------------------------------------------------------------
	*/

	const latestAvailableCats = await prisma.cat.findMany({
		where: {
			status: 'AVAILABLE'
		},
		orderBy: {
			created_at: 'desc'
		},
		take: 4,
		include: {
			media: true
		}
	});

	const latestAdoptedCats = await prisma.cat.findMany({
		where: {
			status: 'ADOPTED'
		},
		orderBy: {
			updated_at: 'desc'
		},
		take: 4,
		include: {
			media: true
		}
	});

	/*
	|--------------------------------------------------------------------------
	| RETURN
	|--------------------------------------------------------------------------
	*/

	return {
		user: {
			id: volunteer.id,
			role: volunteer.role,
			firstName: volunteer.profil.firstName,
			lastName: volunteer.profil.lastName
		},

		stats: {
			volunteerCats,
			volunteerHosts,
			volunteerAdoptions,

			totalAvailableCats,
			totalActiveHosts,
			totalYearAdoptions,
			totalVolunteers
		},

		dashboardTasks,
		quickActions,
		latestAvailableCats,
		latestAdoptedCats
	};
};
