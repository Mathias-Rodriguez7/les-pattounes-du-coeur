// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				role: Prisma.VolunteerRole;
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
