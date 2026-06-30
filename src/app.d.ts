/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				role: import('../generated/prisma/enums').VolunteerRole;
				profil: {
					firstName: string;
					lastName: string;
					email: string;
				};
			} | null;
		}

		interface PageData {
			user: App.Locals['user'];
		}
	}
}

export {};
