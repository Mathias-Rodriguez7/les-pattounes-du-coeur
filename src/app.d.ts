import type { VolunteerRole } from '@prisma/client';
import type { AppUser } from '$lib/types/user';

declare global {
	namespace App {
		interface Locals {
			user: AppUser | null;
			session: {
				id: string;
				token: string;
				volunteerId: string;
				expiresAt: Date;
				volunteer: {
					id: string;
					role: VolunteerRole;
					profil: AppUser['profil'];
				};
			} | null;
		}

		interface PageData {
			user: App.Locals['user'];
		}
	}
}

export {};
