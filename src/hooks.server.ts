import type { Handle } from '@sveltejs/kit';
import type { VolunteerRole } from '@prisma/client';
import { building } from '$app/environment';
import cron from 'node-cron';
import prisma from '$lib/server/prisma';
import { updateExpiredBreaks } from '$lib/server/cron/updateHostVolunteerStatus';

// ✅ Définir le type de l'utilisateur
export interface AppUser {
	id: string;
	role: VolunteerRole;
	profil: {
		firstName: string;
		lastName: string;
		email: string;
	};
}

// ✅ Initialiser les crons (une seule fois au démarrage)
if (!building) {
	console.log('[CRON] 🚀 Initialisation des tâches programmées...');

	// Toutes les heures
	cron.schedule('0 * * * *', async () => {
		console.log('[CRON] 🕐 Vérification des pauses expirées...');
		try {
			const result = await updateExpiredBreaks();
			console.log(`[CRON] ✅ ${result.hosts} hosts, ${result.volunteers} volunteers mis à jour`);
		} catch (error) {
			console.error('[CRON] ❌ Erreur:', error);
		}
	});

	console.log('[CRON] 📋 Tâches programmées avec succès');
}

// ✅ Gestion des sessions (inchangé)
export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (!token) {
		event.locals.user = null;
		return resolve(event);
	}

	const session = await prisma.session.findUnique({
		where: { token },
		include: {
			volunteer: {
				include: { profil: true }
			}
		}
	});

	if (!session || session.expiresAt < new Date()) {
		if (session) {
			await prisma.session.delete({
				where: { token: session.token }
			});
		}

		event.cookies.delete('session', { path: '/' });
		event.locals.user = null;

		return resolve(event);
	}

	event.locals.user = {
		id: session.volunteer.id,
		role: session.volunteer.role,
		profil: {
			firstName: session.volunteer.profil!.firstName,
			lastName: session.volunteer.profil!.lastName,
			email: session.volunteer.profil!.email
		}
	};

	return resolve(event);
};
