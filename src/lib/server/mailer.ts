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
import type { InvitationKind } from '@prisma/client';

const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: Number(SMTP_PORT), // 587 par défaut (src/env.ts)
	secure: false,
	auth: { user: SMTP_USER, pass: SMTP_PASS }
});

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
	city: string;
	postalCode?: string;
	description: string;
};

/** Envoie un signalement SOS à l'association. « Répondre » écrit directement au visiteur. */
export async function sendSosAlertEmail(alert: SosAlert) {
	const to = ASSOCIATION_EMAIL;
	if (!to) throw new Error('ASSOCIATION_EMAIL manquant dans la configuration');

	const type = SOS_ALERT_TYPES[alert.alertType];
	const name = `${alert.firstName} ${alert.lastName}`;
	const place = [alert.address, [alert.postalCode, alert.city].filter(Boolean).join(' ')].join(
		', '
	);

	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		replyTo: alert.email,
		subject: `🚨 SOS : ${type} (${place})`,
		text: `Nouveau signalement SOS

Type : ${type}
Lieu : ${place}

De : ${name}
Téléphone : ${alert.phone}
E-mail : ${alert.email}

Description :
${alert.description}`,
		html: `
			<h2>🚨 Nouveau signalement SOS</h2>
			<p><strong>Type :</strong> ${escapeHtml(type)}<br>
			<strong>Lieu :</strong> ${escapeHtml(place)}</p>
			<p><strong>De :</strong> ${escapeHtml(name)}<br>
			<strong>Téléphone :</strong> ${escapeHtml(alert.phone)}<br>
			<strong>E-mail :</strong> ${escapeHtml(alert.email)}</p>
			<p><strong>Description :</strong></p>
			<p style="white-space: pre-line">${escapeHtml(alert.description)}</p>
		`
	});
}

type VolunteerContact = { name: string; email: string };

/** La signature des emails écrits au nom d'une bénévole */
function volunteerSignature(volunteer: VolunteerContact) {
	return {
		text: `${volunteer.name}\nBénévole – Les Pattounes du Cœur\n${volunteer.email}`,
		html: `<p>${escapeHtml(volunteer.name)}<br>Bénévole – Les Pattounes du Cœur<br>
			<a href="mailto:${escapeHtml(volunteer.email)}">${escapeHtml(volunteer.email)}</a></p>`
	};
}

/**
 * Refus d'une demande d'adoption : le message écrit par la bénévole.
 * « Répondre » écrit directement à la bénévole (replyTo).
 */
export async function sendAdoptionRejectedEmail({
	to,
	message,
	volunteer
}: {
	to: string;
	message: string;
	volunteer: VolunteerContact;
}) {
	const signature = volunteerSignature(volunteer);
	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		replyTo: volunteer.email,
		subject: 'Votre demande d’adoption – Les Pattounes du Cœur',
		text: `${message}\n\n${signature.text}`,
		html: `<p style="white-space: pre-line">${escapeHtml(message)}</p>\n${signature.html}`
	});
}

/**
 * Le chat demandé vient d'être adopté par une autre famille : email type.
 * Il propose les autres chats, et la bénévole à contacter (« Répondre » lui écrit).
 */
export async function sendAdoptedElsewhereEmail({
	to,
	firstName,
	catName,
	volunteer,
	catsUrl
}: {
	to: string;
	firstName: string | null;
	catName: string | null;
	volunteer: VolunteerContact;
	catsUrl: string;
}) {
	const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';
	const cat = catName ?? 'Le chat que vous avez demandé';
	const signature = volunteerSignature(volunteer);

	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		replyTo: volunteer.email,
		subject: `${cat} a trouvé une famille – Les Pattounes du Cœur`,
		text: `${greeting}

Merci pour votre demande d’adoption. ${cat} vient de trouver une famille : nous ne pouvons donc pas donner suite à votre demande.

D’autres chats attendent encore la leur ! Vous pouvez :
- consulter les chats disponibles : ${catsUrl}
- écrire à ${volunteer.name}, qui suivait votre demande : ${volunteer.email} (ou simplement répondre à cet email)

Merci pour l’intérêt que vous portez à nos protégés.

${signature.text}`,
		html: `<p>${escapeHtml(greeting)}</p>
			<p>Merci pour votre demande d’adoption. ${escapeHtml(cat)} vient de trouver une famille : nous ne pouvons donc pas donner suite à votre demande.</p>
			<p>D’autres chats attendent encore la leur ! Vous pouvez :</p>
			<ul>
				<li><a href="${escapeHtml(catsUrl)}">consulter les chats disponibles</a> ;</li>
				<li>écrire à ${escapeHtml(volunteer.name)}, qui suivait votre demande : <a href="mailto:${escapeHtml(volunteer.email)}">${escapeHtml(volunteer.email)}</a> (ou simplement répondre à cet email).</li>
			</ul>
			<p>Merci pour l’intérêt que vous portez à nos protégés.</p>
			${signature.html}`
	});
}

const INVITATION_TEXTS = {
	HOST: {
		subject: 'Bienvenue chez les Pattounes : une dernière étape',
		intro:
			"Merci de rejoindre nos familles d'accueil ! Avant de finaliser votre inscription, merci de lire notre Convention famille d'accueil et de l'accepter.",
		button: 'Lire et valider'
	},
	VOLUNTEER: {
		subject: 'Bienvenue chez les Pattounes : créez votre compte bénévole',
		intro:
			'Merci de rejoindre notre équipe de bénévoles ! Avant de créer votre compte, merci de lire le Manuel de la gestionnaire et de l’accepter. Vous choisirez ensuite votre mot de passe.',
		button: 'Lire et créer mon compte'
	}
} as const satisfies Record<InvitationKind, { subject: string; intro: string; button: string }>;

/** L'invitation à lire et accepter le document (lien valable jusqu'à `expiresAt`) */
export async function sendInvitationEmail({
	to,
	firstName,
	kind,
	url,
	expiresAt
}: {
	to: string;
	firstName: string;
	kind: InvitationKind;
	url: string;
	expiresAt: Date;
}) {
	const texts = INVITATION_TEXTS[kind];
	const until = expiresAt.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });

	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		subject: texts.subject,
		text: `Bonjour ${firstName},

${texts.intro}

${texts.button} : ${url}

Ce lien est valable jusqu'au ${until}.

L'équipe des Pattounes du Cœur`,
		html: `<p>Bonjour ${escapeHtml(firstName)},</p>
			<p>${escapeHtml(texts.intro)}</p>
			<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 18px;background:#dd6476;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:bold">${escapeHtml(texts.button)}</a></p>
			<p style="color:#666;font-size:13px">Ce lien est valable jusqu'au ${until}.</p>
			<p>L'équipe des Pattounes du Cœur</p>`
	});
}

const DIGEST_URGENCY = {
	URGENT: { label: 'Urgent', color: '#b91c1c' },
	WEEK: { label: 'Cette semaine', color: '#b45309' },
	WATCH: { label: 'À surveiller', color: '#475569' }
} as const;

/** Le récapitulatif du lundi : ses tâches, rangées par urgence, chacune avec son lien */
export async function sendWeeklyDigestEmail({
	to,
	firstName,
	sections,
	dashboardUrl,
	profileUrl
}: {
	to: string;
	firstName: string;
	sections: {
		title: string;
		tasks: { title: string; detail: string; urgency: keyof typeof DIGEST_URGENCY; url: string }[];
	}[];
	dashboardUrl: string;
	profileUrl: string;
}) {
	const total = sections.reduce((sum, section) => sum + section.tasks.length, 0);
	const urgent = sections.reduce(
		(sum, section) => sum + section.tasks.filter((task) => task.urgency === 'URGENT').length,
		0
	);
	const subject =
		urgent > 0
			? `Vos tâches de la semaine : ${urgent} urgente${urgent > 1 ? 's' : ''} sur ${total}`
			: `Vos tâches de la semaine (${total})`;

	const text = `Bonjour ${firstName},

Voici ce qui vous attend cette semaine aux Pattounes du Cœur.

${sections
	.map(
		(section) =>
			`${section.title.toUpperCase()}\n${section.tasks
				.map(
					(task) =>
						`- [${DIGEST_URGENCY[task.urgency].label}] ${task.title} (${task.detail})\n  ${task.url}`
				)
				.join('\n')}`
	)
	.join('\n\n')}

Tout votre tableau de bord : ${dashboardUrl}

Pour ne plus recevoir ce récapitulatif : ${profileUrl}`;

	const html = `<p>Bonjour ${escapeHtml(firstName)},</p>
		<p>Voici ce qui vous attend cette semaine aux Pattounes du Cœur.</p>
		${sections
			.map(
				(section) => `<h3 style="margin:20px 0 8px;font-size:16px">${escapeHtml(section.title)}</h3>
				<table role="presentation" style="border-collapse:collapse;width:100%">
				${section.tasks
					.map(
						(task) => `<tr><td style="padding:8px 0;border-top:1px solid #eee">
							<span style="font-size:12px;font-weight:bold;color:${DIGEST_URGENCY[task.urgency].color}">${DIGEST_URGENCY[task.urgency].label}</span><br>
							<a href="${escapeHtml(task.url)}" style="color:#111;font-weight:bold;text-decoration:none">${escapeHtml(task.title)}</a><br>
							<span style="color:#666;font-size:13px">${escapeHtml(task.detail)}</span>
						</td></tr>`
					)
					.join('')}
				</table>`
			)
			.join('')}
		<p style="margin-top:24px"><a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:10px 18px;background:#dd6476;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:bold">Ouvrir mon tableau de bord</a></p>
		<p style="color:#666;font-size:12px">Pour ne plus recevoir ce récapitulatif, décochez-le dans <a href="${escapeHtml(profileUrl)}">votre profil</a>.</p>`;

	await transporter.sendMail({ from: SMTP_FROM, to, subject, text, html });
}
