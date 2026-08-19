<<<<<<< HEAD
import type { VolunteerRole } from '$generated/prisma';
=======
/// <reference types="@sveltejs/kit" />
>>>>>>> 07bc7eca6556711f31545456f544ec81f9c8971a

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
<<<<<<< HEAD
				role: VolunteerRole;
=======
				role: import('../generated/prisma/enums').VolunteerRole;
>>>>>>> 07bc7eca6556711f31545456f544ec81f9c8971a
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
