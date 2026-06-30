import type { Handle } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

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
