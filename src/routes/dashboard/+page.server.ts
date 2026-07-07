import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';
import type { CatWithMedia, AdoptionTrendItem } from '$lib/types';

type DashboardTask = {
	label: string;
	value: number;
	description: string;
	icon: string;
	href?: string;
};

type TaskGroup = {
	theme: string;
	icon: string;
	tasks: DashboardTask[];
};

type QuickAction = {
	label: string;
	description: string;
	href: string;
	icon: string;
};

// TYPES POUR LES GRAPHIQUES
type VolunteerStat = {
	volunteerId: string;
	volunteerName: string;
	catsManaged: number;
	catsAdopted: number;
};

type RadarChartData = {
	volunteer: string;
	AVAILABLE: number;
	SOCIALIZE: number;
	ADOPTED: number;
	FREE: number;
};

// ✅ TYPE AVEC TYPAGE CORRECT
export type PageData = {
	user: {
		id: string;
		role: string;
		firstName: string;
		lastName: string;
	} | null;
	stats: {
		volunteerCatsManaged: number;
		volunteerAdoptions: number;
		totalAssociationCats: number;
		totalActiveHosts: number;
		availableHostFamilies: number;
		totalYearAdoptions: number;
		totalVolunteers: number;
	};
	taskGroups: TaskGroup[];
	quickActions: QuickAction[];
	latestAvailableCats: CatWithMedia[];
	latestAdoptedCats: CatWithMedia[];
	adoptionTrend: AdoptionTrendItem[];
	conversionRate: number;
	// NOUVELLES DONNÉES POUR LES GRAPHIQUES
	volunteerStats: VolunteerStat[];
	radarChartData: RadarChartData[];
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
    | STATS PERSONNELLES DU BÉNÉVOLE
    |--------------------------------------------------------------------------
    */

	const volunteerCatsManaged = volunteer.cats.length;

	const hostIds = new Set<string>();
	volunteer.cats.forEach((relation) => {
		relation.cat.placements.forEach((placement) => {
			hostIds.add(placement.hostId);
		});
	});

	const volunteerAdoptions = volunteer.cats.filter(
		(relation) => relation.cat.adoptions.length > 0
	).length;

	/*
    |--------------------------------------------------------------------------
    | STATS GLOBALES DE L'ASSOCIATION
    |--------------------------------------------------------------------------
    */

	const currentYear = new Date().getFullYear();
	const yearStart = new Date(`${currentYear}-01-01`);

	const [totalAssociationCats, totalYearAdoptions, totalVolunteers, allActiveHosts] =
		await Promise.all([
			prisma.cat.count(),

			prisma.adoption.count({
				where: {
					created_at: {
						gte: yearStart
					}
				}
			}),

			prisma.volunteer.count({
				where: {
					actif: 'ACTIVE'
				}
			}),

			prisma.host.findMany({
				where: {
					actif: 'ACTIVE'
				},
				include: {
					placements: {
						where: {
							ended: null
						}
					}
				}
			})
		]);

	const availableHostFamilies = allActiveHosts.filter(
		(host) => host.placements.length === 0
	).length;
	const totalActiveHosts = allActiveHosts.length;

	/*
    |--------------------------------------------------------------------------
    | ADOPTION TREND
    |--------------------------------------------------------------------------
    */

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const adoptionTrend = await prisma.adoption.groupBy({
		by: ['created_at'],
		where: {
			created_at: {
				gte: thirtyDaysAgo
			}
		},
		_count: {
			id: true
		},
		orderBy: {
			created_at: 'asc'
		}
	});

	/*
    |--------------------------------------------------------------------------
    | CONVERSION RATE
    |--------------------------------------------------------------------------
    */

	const [totalCats, adoptedCats] = await Promise.all([
		prisma.cat.count(),
		prisma.cat.count({
			where: {
				status: 'ADOPTED'
			}
		})
	]);

	const conversionRate = totalCats > 0 ? Math.round((adoptedCats / totalCats) * 100) : 0;

	/*
    |--------------------------------------------------------------------------
    | TASK GROUPS
    |--------------------------------------------------------------------------
    */

	let taskGroups: TaskGroup[] = [
		{ theme: 'Chats', icon: 'cat', tasks: [] },
		{ theme: "Familles d'accueil", icon: 'house', tasks: [] },
		{ theme: 'Candidatures', icon: 'mail', tasks: [] }
	];

	/*
    |--------------------------------------------------------------------------
    | ADMIN TASKS
    |--------------------------------------------------------------------------
    */

	if (user.role === 'ADMIN') {
		const [findFA, createFA, treatForms, completeCats] = await Promise.all([
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
			}),

			prisma.cat.count({
				where: {
					OR: [{ name: null }, { description: null }, { chipId: null }]
				}
			})
		]);

		taskGroups = [
			{
				theme: 'Chats',
				icon: 'cat',
				tasks: [
					{
						label: 'Compléter les chats',
						value: completeCats,
						description: 'Informations manquantes',
						icon: 'cat',
						href: '/dashboard/cats'
					},
					{
						label: 'Associer un chat à une FA',
						value: findFA,
						description: "Chats sans famille d'accueil",
						icon: 'search',
						href: '/dashboard/cats'
					}
				]
			},
			{
				theme: "Familles d'accueil",
				icon: 'house',
				tasks: [
					{
						label: 'Créer des FA',
						value: createFA,
						description: 'Candidatures de FA en attente',
						icon: 'plus',
						href: '/dashboard/hosts'
					}
				]
			},
			{
				theme: 'Candidatures',
				icon: 'mail',
				tasks: [
					{
						label: 'Traiter les candidatures',
						value: treatForms,
						description: 'Formulaires à traiter',
						icon: 'clipboard',
						href: '/dashboard/forms'
					}
				]
			}
		];
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

		taskGroups = [
			{
				theme: 'Chats',
				icon: 'cat',
				tasks: [
					{
						label: 'Compléter les chats',
						value: completeCats,
						description: 'Informations manquantes',
						icon: 'cat',
						href: '/dashboard/cats'
					}
				]
			},
			{
				theme: "Familles d'accueil",
				icon: 'house',
				tasks: []
			},
			{
				theme: 'Candidatures',
				icon: 'mail',
				tasks: [
					{
						label: 'Traiter les candidatures',
						value: treatForms,
						description: 'Formulaires assignés',
						icon: 'clipboard',
						href: '/dashboard/forms'
					}
				]
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
				description: "Créer une nouvelle famille d'accueil.",
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
    | DONNÉES POUR LES GRAPHIQUES
    |--------------------------------------------------------------------------
    */

	// ========== GRAPHIQUE 1 & 2 ==========
	// Récupérer tous les bénévoles actifs avec leurs chats et adoptions
	const volunteersWithStats = await prisma.volunteer.findMany({
		where: {
			actif: 'ACTIVE'
		},
		include: {
			profil: true,
			cats: {
				include: {
					cat: {
						include: {
							adoptions: true
						}
					}
				}
			}
		}
	});

	// Traiter les données pour les graphiques 1 et 2
	const volunteerStats: VolunteerStat[] = volunteersWithStats.map((vol) => {
		// Chats gérés par ce bénévole (créés cette année)
		const catsManaged = vol.cats.filter((cv) => {
			return cv.cat.created_at >= yearStart;
		}).length;

		// Chats adoptés par ce bénévole (adoptions créées cette année)
		const catsAdopted = vol.cats.filter((cv) => {
			const adoption = cv.cat.adoptions[0];
			if (!adoption) return false;
			return adoption.created_at >= yearStart;
		}).length;

		return {
			volunteerId: vol.id,
			volunteerName: `${vol.profil.firstName} ${vol.profil.lastName}`,
			catsManaged,
			catsAdopted
		};
	});

	// ========== GRAPHIQUE 3 ==========
	// Récupérer tous les chats pour la distribution des statuts
	const allCatsWithVolunteers = await prisma.cat.findMany({
		include: {
			volunteers: true
		}
	});

	// Traiter les données pour le Radar Chart
	const radarChartData: RadarChartData[] = volunteersWithStats.map((vol) => {
		// Récupérer les IDs des chats gérés par ce bénévole
		const volunteerCatIds = vol.cats.map((cv) => cv.catId);

		// Filtrer les chats gérés par ce bénévole
		const volunteerCats = allCatsWithVolunteers.filter((cat) => volunteerCatIds.includes(cat.id));

		// Compter les statuts
		const available = volunteerCats.filter((c) => c.status === 'AVAILABLE').length;
		const socialize = volunteerCats.filter((c) => c.status === 'SOCIALIZE').length;
		const adopted = volunteerCats.filter((c) => c.status === 'ADOPTED').length;
		const free = volunteerCats.filter((c) => c.status === 'FREE').length;

		return {
			volunteer: `${vol.profil.firstName} ${vol.profil.lastName}`,
			AVAILABLE: available,
			SOCIALIZE: socialize,
			ADOPTED: adopted,
			FREE: free
		};
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
			volunteerCatsManaged,
			volunteerAdoptions,
			totalAssociationCats,
			totalActiveHosts,
			availableHostFamilies,
			totalYearAdoptions,
			totalVolunteers
		},

		taskGroups,
		quickActions,
		latestAvailableCats,
		latestAdoptedCats,
		adoptionTrend,
		conversionRate,

		// DONNÉES POUR LES GRAPHIQUES
		volunteerStats,
		radarChartData
	};
};
