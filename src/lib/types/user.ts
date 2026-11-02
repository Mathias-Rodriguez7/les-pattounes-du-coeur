// src/lib/types/user.ts
import type { VolunteerRole } from '@prisma/client';

export interface AppUser {
	id: string;
	role: VolunteerRole;
	profil: {
		firstName: string;
		lastName: string;
		email: string;
	};
}
