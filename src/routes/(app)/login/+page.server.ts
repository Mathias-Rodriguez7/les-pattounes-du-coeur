import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword } from '#lib/server/hashing.ts';
import prisma from '#lib/server/prisma.ts';
import { activeBlacklists, isAccountDisabled } from '#lib/server/accountStatus.ts';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const email = form.get('email')?.toString().trim().toLowerCase();
		const password = form.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Veuillez remplir tous les champs.' });
		}

		const volunteer = await prisma.volunteer.findFirst({
			where: {
				profil: {
					email
				}
			},
			// Seul endroit où le mot de passe chiffré est lu : pour le comparer
			omit: { password: false },
			include: {
				profil: {
					include: { blacklists: activeBlacklists }
				}
			}
		});

		if (!volunteer) {
			return fail(400, { error: 'Email ou mot de passe incorrect.' });
		}

		const valid = await verifyPassword(volunteer.password, password);

		if (!valid) {
			return fail(400, { error: 'Email ou mot de passe incorrect.' });
		}

		if (isAccountDisabled(volunteer)) {
			return fail(403, { error: "Votre compte est désactivé. Contactez l'association." });
		}

		// session simple (tu adapteras avec ton model Session)
		const sessionToken = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

		await prisma.session.create({
			data: {
				token: sessionToken,
				volunteerId: volunteer.id,
				expiresAt
			}
		});

		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			expires: expiresAt
		});

		throw redirect(303, '/dashboard');
	}
};
