import { fail, redirect } from '@sveltejs/kit';
import argon2 from 'argon2';
import { prisma } from '$lib/server/prisma';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const email = form.get('email')?.toString();
		const password = form.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Missing fields' });
		}

		const volunteer = await prisma.volunteer.findFirst({
			where: {
				profil: {
					email
				}
			},
			include: {
				profil: true
			}
		});

		if (!volunteer) {
			return fail(400, { error: 'Invalid credentials' });
		}

		const valid = await argon2.verify(volunteer.password, password);

		if (!valid) {
			return fail(400, { error: 'Invalid credentials' });
		}

		// session simple (tu adapteras avec ton model Session)
		const sessionToken = crypto.randomUUID();

		await prisma.session.create({
			data: {
				token: sessionToken,
				volunteerId: volunteer.id,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
			}
		});

		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: false
		});

		throw redirect(303, '/dashboard');
	}
};
