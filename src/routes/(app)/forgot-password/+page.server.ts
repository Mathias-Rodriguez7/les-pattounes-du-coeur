import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/prisma';
import { sendResetPasswordEmail } from '$lib/server/mail';
import { randomBytes, createHash } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString().trim().toLowerCase();

		if (!email) {
			return fail(400, { error: 'Veuillez saisir votre adresse email.' });
		}

		const profil = await prisma.profil.findUnique({
			where: { email },
			include: { volunteer: true }
		});

		// Réponse identique que le compte existe ou non (pas de fuite d'information)
		const successMessage = {
			success: true,
			message: 'Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.'
		};

		if (!profil?.volunteer) {
			return successMessage;
		}

		const token = randomBytes(32).toString('hex');
		const hashedToken = createHash('sha256').update(token).digest('hex');

		await prisma.volunteer.update({
			where: { id: profil.volunteer.id },
			data: {
				resetToken: hashedToken,
				resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
			}
		});

		const resetUrl = `${env.PUBLIC_APP_URL}/reinitialisation/${token}`;

		try {
			await sendResetPasswordEmail(profil.email, resetUrl);
		} catch (err) {
			console.error('Erreur envoi mail reset password :', err);
		}

		return successMessage;
	}
};
