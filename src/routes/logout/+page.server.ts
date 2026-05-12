import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies }) => {
		const token = cookies.get('session');

		if (token) {
			await prisma.session.deleteMany({
				where: {
					token
				}
			});
		}

		cookies.delete('session', {
			path: '/'
		});

		throw redirect(303, '/');
	}
};
