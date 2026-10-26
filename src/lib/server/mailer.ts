// src/lib/server/mailer.ts
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: Number(env.SMTP_PORT ?? 587),
	secure: false,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS
	}
});

export async function sendVolunteerWelcomeEmail({
	to,
	firstName,
	email,
	tempPassword,
	isExistingProfil = false
}: {
	to: string;
	firstName: string;
	email: string;
	tempPassword: string;
	isExistingProfil?: boolean;
}) {
	const intro = isExistingProfil
		? 'Vous êtes désormais également bénévole. Vous pouvez dès maintenant accéder à votre espace avec les identifiants ci-dessous.'
		: 'Votre compte bénévole a été créé.';

	await transporter.sendMail({
		from: env.SMTP_FROM,
		to,
		subject: 'Votre accès bénévole',
		text: `Bonjour ${firstName},

${intro}

Identifiant : ${email}
Mot de passe temporaire : ${tempPassword}

Nous vous conseillons de le modifier dès votre première connexion.`,
		html: `
            <p>Bonjour ${firstName},</p>
            <p>${intro}</p>
            <ul>
                <li><strong>Identifiant :</strong> ${email}</li>
                <li><strong>Mot de passe temporaire :</strong> ${tempPassword}</li>
            </ul>
            <p>Nous vous conseillons de le modifier dès votre première connexion.</p>
        `
	});
}
