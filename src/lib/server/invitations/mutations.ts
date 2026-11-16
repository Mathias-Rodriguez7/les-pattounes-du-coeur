import prisma from '#lib/server/prisma.ts';
import type { InvitationKind, Prisma } from '@prisma/client';
import { createHostSchema } from '#lib/schemas/host.ts';
import { createVolunteerSchema } from '#lib/schemas/volunteer.ts';
import { hashPassword } from '#lib/server/hashing.ts';
import { isEmailBlacklisted } from '#lib/server/accountStatus.ts';
import { sendInvitationEmail } from '#lib/server/mailer.ts';
import { persistHost } from '#lib/server/hosts/persist.ts';
import { persistVolunteer } from '#lib/server/volunteers/persist.ts';
import { CHARTER_NAME, currentCharter } from './charters';
import { SignupError } from './errors';
import { hashInvitationToken, invitationExpiry, newInvitationToken } from './token';

// =====================================================================
// INSCRIPTION EN DEUX TEMPS
// 1. inviteToJoin : l'admin a rempli le formulaire → une invitation + un email avec un lien
// 2. acceptInvitation : la personne a lu et accepté le document → tout est créé, d'un coup
// =====================================================================

/** Le lien de l'email (la page publique de validation) */
export const invitationUrl = (origin: string, token: string) => `${origin}/inscription/${token}`;

/**
 * Crée l'invitation et envoie l'email. Rien n'est encore créé : ni FA, ni compte.
 * `data` : le formulaire tel qu'envoyé (déjà validé par l'appelant). Il sera revalidé
 * à l'acceptation : c'est ce qui sera réellement enregistré.
 */
export async function inviteToJoin({
	kind,
	data,
	email,
	firstName,
	formId,
	createdById,
	origin
}: {
	kind: InvitationKind;
	data: Record<string, string | null>;
	email: string;
	firstName: string;
	formId?: string | null;
	createdById: string | null;
	origin: string;
}) {
	// Sans document à accepter, pas d'inscription : on le dit à l'admin
	if (!(await currentCharter(kind))) {
		return {
			success: false as const,
			error: `Déposez d'abord ${CHARTER_NAME[kind]} dans la page Documents : elle doit être acceptée avant toute inscription.`
		};
	}

	const { token, tokenHash } = newInvitationToken();
	const expiresAt = invitationExpiry();

	// Une seule invitation en cours par personne et par rôle : la nouvelle remplace l'ancienne
	await prisma.$transaction([
		prisma.invitation.deleteMany({ where: { email, kind } }),
		prisma.invitation.create({
			data: {
				kind,
				email,
				data: data as Prisma.InputJsonObject,
				tokenHash,
				expiresAt,
				formId: formId || null,
				createdById
			}
		})
	]);

	try {
		await sendInvitationEmail({
			to: email,
			firstName,
			kind,
			url: invitationUrl(origin, token),
			expiresAt
		});
	} catch (error) {
		console.error("❌ Email d'invitation non envoyé :", error);
		return {
			success: true as const,
			emailSent: false,
			message: "Invitation créée, mais l'email n'a pas pu partir : utilisez « Renvoyer »"
		};
	}

	return {
		success: true as const,
		emailSent: true,
		message:
			kind === 'HOST'
				? `Invitation envoyée à ${email} : la FA sera créée dès qu'elle aura accepté la Convention`
				: `Invitation envoyée à ${email} : le compte sera créé dès qu'elle aura accepté le Manuel`
	};
}

/** L'invitation d'un lien, si elle existe et n'a pas expiré (sinon null) */
export async function findValidInvitation(token: string) {
	const invitation = await prisma.invitation.findUnique({
		where: { tokenHash: hashInvitationToken(token) }
	});
	if (!invitation || invitation.expiresAt < new Date()) return null;
	return invitation;
}

/**
 * La personne accepte le document : on crée la FA (ou le compte bénévole), on enregistre
 * l'acceptation, on accepte la demande d'origine, et on supprime l'invitation.
 * Tout dans UNE transaction : jamais une FA sans preuve d'acceptation, ni l'inverse.
 * Lance une SignupError (message pour la personne) si c'est impossible.
 */
export async function acceptInvitation(
	token: string,
	{ documentId, password }: { documentId: string; password?: string }
) {
	// Le hachage est lent : on le fait AVANT la transaction (qui doit rester courte)
	const hashedPassword = password ? await hashPassword(password) : null;

	return prisma.$transaction(async (tx) => {
		const invitation = await tx.invitation.findUnique({
			where: { tokenHash: hashInvitationToken(token) }
		});
		if (!invitation || invitation.expiresAt < new Date()) {
			throw new SignupError(
				"Ce lien n'est plus valable. Demandez à l'association de vous renvoyer une invitation."
			);
		}

		// Le document lu doit être celui en vigueur (il a pu être remplacé entre-temps)
		const charter = await currentCharter(invitation.kind, tx);
		if (!charter || charter.id !== documentId) {
			throw new SignupError(
				'Le document a été mis à jour : rechargez la page pour lire la nouvelle version.'
			);
		}

		if (await isEmailBlacklisted(invitation.email, tx)) {
			throw new SignupError("Inscription impossible : contactez l'association.");
		}

		// Les données de l'admin, revalidées : c'est le schéma qui décide de ce qui est enregistré
		let profilId: string;
		let volunteerId: string | null = null;
		if (invitation.kind === 'HOST') {
			const parsed = createHostSchema.safeParse(invitation.data);
			if (!parsed.success) {
				throw new SignupError("Votre fiche est incomplète : contactez l'association.");
			}
			profilId = (await persistHost(tx, parsed.data)).profilId;
		} else {
			if (!hashedPassword) throw new SignupError('Choisissez un mot de passe.');
			const parsed = createVolunteerSchema.safeParse(invitation.data);
			if (!parsed.success) {
				throw new SignupError("Votre fiche est incomplète : contactez l'association.");
			}
			const volunteer = await persistVolunteer(tx, parsed.data, hashedPassword);
			profilId = volunteer.profilId;
			volunteerId = volunteer.id;
		}

		// La preuve : qui, quel document, quand
		await tx.charterAcceptance.upsert({
			where: { profilId_documentId: { profilId, documentId } },
			create: { profilId, documentId },
			update: {}
		});

		// La demande publique d'origine (s'il y en a une) est maintenant acceptée
		if (invitation.formId) {
			await tx.form.updateMany({
				where: { id: invitation.formId, status: 'PENDING' },
				data: { status: 'APPROVED' }
			});
		}

		await tx.invitation.deleteMany({
			where: { email: invitation.email, kind: invitation.kind }
		});

		return { kind: invitation.kind, volunteerId };
	});
}
