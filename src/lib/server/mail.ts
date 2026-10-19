import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: Number(env.SMTP_PORT),
	secure: env.SMTP_PORT === '465',
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS
	}
});

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
	await transporter.sendMail({
		from: env.SMTP_FROM,
		to,
		subject: 'Réinitialisation de votre mot de passe',
		text: `Bonjour,\n\nPour réinitialiser votre mot de passe, cliquez sur le lien suivant (valable 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
		html: `<p>Bonjour,</p>
<p>Pour réinitialiser votre mot de passe, cliquez sur le lien suivant (valable 1 heure) :</p>
<p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
<p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`
	});
}
