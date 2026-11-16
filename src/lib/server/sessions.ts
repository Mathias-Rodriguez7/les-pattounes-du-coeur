import type { Cookies } from '@sveltejs/kit';
import prisma from '#lib/server/prisma.ts';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24; // 24 h

/**
 * Connecte une bénévole : une session en base + le cookie.
 * Utilisée par la page de connexion ET la fin de l'inscription (elle arrive connectée).
 */
export async function startSession(cookies: Cookies, volunteerId: string) {
	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

	await prisma.session.create({ data: { token, volunteerId, expiresAt } });

	cookies.set('session', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		expires: expiresAt
	});
}
