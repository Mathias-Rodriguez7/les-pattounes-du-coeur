import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

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

	// hosts uniques liés aux chats du bénévole
	const hostIds = new Set<string>();

	volunteer.cats.forEach((relation) => {
		relation.cat.placements.forEach((placement) => {
			hostIds.add(placement.hostId);
		});
	});

	const volunteerHosts = hostIds.size;

	// chats adoptés du bénévole
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
			// personnelles
			volunteerCats,
			volunteerHosts,
			volunteerAdoptions,

			// globales
			totalAvailableCats,
			totalActiveHosts,
			totalYearAdoptions,
			totalVolunteers
		},

		latestAvailableCats,
		latestAdoptedCats
	};
};
