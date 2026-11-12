import { redirect } from '@sveltejs/kit';
import type { VolunteerRole } from '@prisma/client';
import type { AppUser } from '#lib/types/user.ts';

// =====================================================================
// LA règle « qui est admin », écrite UNE fois pour tout le serveur.
// locals.user est rechargé depuis la base à CHAQUE requête (hooks.server.ts) :
// inutile de relire le rôle en base dans une page ou une action.
// =====================================================================

/** Admin ? Accepte locals.user, ou un bénévole lu en base (tout objet avec un `role`) */
export function hasAdminRole(user: { role: VolunteerRole } | null | undefined): boolean {
	return user?.role === 'ADMIN';
}

/**
 * Pour un `load` : la personne doit être connectée, sinon retour à l'accueil.
 * Renvoie l'utilisatrice, typée NON nulle pour la suite du code.
 * ⚠️ redirect() fonctionne en lançant une exception : appeler AVANT un try/catch.
 */
export function requireUser(locals: App.Locals): AppUser {
	if (!locals.user) redirect(302, '/');
	return locals.user;
}

/** Pour le `load` d'une page réservée à l'admin (même règle : AVANT un try/catch) */
export function requireAdmin(locals: App.Locals, fallback: '/' | '/dashboard' = '/'): AppUser {
	const user = requireUser(locals);
	if (!hasAdminRole(user)) redirect(302, fallback);
	return user;
}
