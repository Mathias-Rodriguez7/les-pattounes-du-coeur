import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import prisma from '$lib/server/prisma';
import type { AppUser } from '$lib/types/user';
import { startCrons } from '$lib/server/cron/updateHostVolunteerStatus';

// Lance les crons une seule fois au démarrage du serveur (pas pendant le build)
if (!building) startCrons();

// Transforme un volontaire Prisma en AppUser (ne garde que les champs utiles)
// Renvoie null si le profil n'existe pas
function toAppUser(volunteer: {
	id: string;
	role: AppUser['role'];
	profil: AppUser['profil'] | null;
}): AppUser | null {
	if (!volunteer.profil) return null;
	return {
		id: volunteer.id,
		role: volunteer.role,
		profil: {
			firstName: volunteer.profil.firstName,
			lastName: volunteer.profil.lastName,
			email: volunteer.profil.email
		}
	};
}

// Exécuté à CHAQUE requête, avant le rendu de la page ou l'exécution d'une action
export const handle: Handle = async ({ event, resolve }) => {
	// 1. Par défaut, aucun utilisateur connecté
	event.locals.user = null;

	// 2. Lecture du cookie de session
	const token = event.cookies.get('session');
	// Pas de cookie → visiteur anonyme, on laisse passer
	if (!token) return resolve(event);

	// 3. Recherche de la session en base, avec le volontaire et son profil
	const session = await prisma.session.findUnique({
		where: { token },
		include: { volunteer: { include: { profil: true } } }
	});

	// 4. Session inexistante ou expirée → nettoyage et visiteur anonyme
	if (!session || session.expiresAt < new Date()) {
		// Supprime la session expirée en base
		if (session) await prisma.session.delete({ where: { token } });
		// Supprime le cookie côté navigateur
		event.cookies.delete('session', { path: '/' });
		return resolve(event);
	}

	// 5. Session valide → on expose l'utilisateur dans event.locals
	// Accessible ensuite dans les +page.server.ts via locals.user
	event.locals.user = toAppUser(session.volunteer);

	// 6. Passe la main à SvelteKit pour la suite du traitement
	return resolve(event);
};
