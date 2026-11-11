import type { VolunteerRole } from '@prisma/client';
import type { AppUser } from '#lib/types/user.ts';

declare global {
	// Verrou des crons (voir src/lib/server/cron/index.ts)
	var __cronsStarted: boolean | undefined;

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
