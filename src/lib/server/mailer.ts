// src/lib/server/mailer.ts
import nodemailer from 'nodemailer';

import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	SMTP_FROM,
	ASSOCIATION_EMAIL
} from '$app/env/private';

import { SOS_ALERT_TYPES, type SosAlertType } from '#lib/constants/sos.ts';

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT ?? 587),
	secure: false,
	auth: { user: SMTP_USER, pass: SMTP_PASS }
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
		from: SMTP_FROM,
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

/** Neutralise le HTML : le texte d'un visiteur ne doit JAMAIS être interprété comme du code */
function escapeHtml(text: string) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

type SosAlert = {
	alertType: SosAlertType;
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
	address: string;
	description: string;
};

/** Envoie un signalement SOS à l'association. « Répondre » écrit directement au visiteur. */
export async function sendSosAlertEmail(alert: SosAlert) {
	const to = ASSOCIATION_EMAIL;
	if (!to) throw new Error('ASSOCIATION_EMAIL manquant dans la configuration');

	const type = SOS_ALERT_TYPES[alert.alertType];
	const name = `${alert.firstName} ${alert.lastName}`;

	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		replyTo: alert.email,
		subject: `🚨 SOS : ${type} (${alert.address})`,
		text: `Nouveau signalement SOS

Type : ${type}
Lieu : ${alert.address}

De : ${name}
Téléphone : ${alert.phone}
E-mail : ${alert.email}

Description :
${alert.description}`,
		html: `
			<h2>🚨 Nouveau signalement SOS</h2>
			<p><strong>Type :</strong> ${escapeHtml(type)}<br>
			<strong>Lieu :</strong> ${escapeHtml(alert.address)}</p>
			<p><strong>De :</strong> ${escapeHtml(name)}<br>
			<strong>Téléphone :</strong> ${escapeHtml(alert.phone)}<br>
			<strong>E-mail :</strong> ${escapeHtml(alert.email)}</p>
			<p><strong>Description :</strong></p>
			<p style="white-space: pre-line">${escapeHtml(alert.description)}</p>
		`
	});
}
