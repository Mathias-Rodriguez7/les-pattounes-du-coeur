import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from '$app/env/private';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT),
	secure: SMTP_PORT === '465',
	auth: { user: SMTP_USER, pass: SMTP_PASS }
});

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		subject: 'Réinitialisation de votre mot de passe',
		text: `Bonjour,\n\nPour réinitialiser votre mot de passe, cliquez sur le lien suivant (valable 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
		html: `<p>Bonjour,</p>
<p>Pour réinitialiser votre mot de passe, cliquez sur le lien suivant (valable 1 heure) :</p>
<p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
<p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`
	});
}
