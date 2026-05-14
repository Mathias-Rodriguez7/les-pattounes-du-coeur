import { prisma } from '$lib/server/prisma';

export async function handle({ event, resolve }) {
	const token = event.cookies.get('session');

	console.log('session' in prisma);
	console.log(Object.keys(prisma));

	if (!token) {
		event.locals.user = null;

		return resolve(event);
	}

	const session = await prisma.session.findUnique({
		where: {
			token
		},
		include: {
			volunteer: {
				include: {
					profil: true
				}
			}
		}
	});

	if (!session || session.expiresAt < new Date()) {
		if (session) {
			await prisma.session.delete({
				where: {
					id: session.id
				}
			});
		}

		event.cookies.delete('session', {
			path: '/'
		});

		event.locals.user = null;

		return resolve(event);
	}

	event.locals.user = {
		id: session.volunteer.id,
		role: session.volunteer.role,
		profil: session.volunteer.profil
	};

	return resolve(event);
}
