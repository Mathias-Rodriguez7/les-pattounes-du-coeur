import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/prisma';
import { sendResetPasswordEmail } from '$lib/server/mail';
import { randomBytes } from 'node:crypto';
import { dev } from '$app/environment';
import { hashToken } from '$lib/server/hashing';

export const actions: Actions = {
	default: async ({ request, url }) => {
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
		const hashedToken = hashToken(token);

		await prisma.volunteer.update({
			where: { id: profil.volunteer.id },
			data: {
				resetToken: hashedToken,
				resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000)
			}
		});

		const resetUrl = `${url.origin}/reset-password?token=${token}`;

		// En développement uniquement : affiche le lien dans le terminal (pas encore de SMTP)
		if (dev) console.log('🔗 Lien de réinitialisation :', resetUrl);
		try {
			await sendResetPasswordEmail(profil.email, resetUrl);
		} catch (err) {
			console.error('Erreur envoi mail reset password :', err);
		}

		return successMessage;
	}
};
