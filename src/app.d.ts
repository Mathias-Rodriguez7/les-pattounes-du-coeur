import type { VolunteerRole } from '$generated/prisma';

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				role: VolunteerRole;
				profil: {
					firstName: string;
					lastName: string;
					email: string;
				};
			} | null;
			session: {
				id: string;
				token: string;
				volunteerId: string;
				expiresAt: Date;
				volunteer: {
					id: string;
					role: import('$generated/prisma').VolunteerRole;
					profil: {
						firstName: string;
						lastName: string;
						email: string;
					};
				};
			} | null;
		}

		interface PageData {
			user: App.Locals['user'];
		}
	}
}

export {};
