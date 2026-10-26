import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { hashPassword } from '$lib/server/password';

async function findVolunteerByToken(token: string) {
	return prisma.volunteer.findFirst({
		where: {
			resetToken: token,
			resetTokenExpiresAt: { gt: new Date() }
		},
		select: { id: true }
	});
}

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return { valid: false };
	}

	const volunteer = await findVolunteerByToken(token);

	return { valid: Boolean(volunteer) };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const token = url.searchParams.get('token');
		const password = data.get('password')?.toString() ?? '';
		const confirmPassword = data.get('confirmPassword')?.toString() ?? '';

		if (!token) {
			return fail(400, { error: 'Lien invalide ou expiré.' });
		}

		const errors: Record<string, string> = {};

		if (password.length < 8) {
			errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
		}

		if (password !== confirmPassword) {
			errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		// Revalidation du token au moment de la soumission
		const volunteer = await findVolunteerByToken(token);

		if (!volunteer) {
			return fail(400, { error: 'Lien invalide ou expiré.' });
		}

		const hashed = await hashPassword(password);

		// Mise à jour du mot de passe et invalidation immédiate du token
		await prisma.volunteer.update({
			where: { id: volunteer.id },
			data: {
				password: hashed,
				resetToken: null,
				resetTokenExpiresAt: null
			}
		});

		redirect(303, '/login?reset=success');
	}
};
