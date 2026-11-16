import { fail, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import prisma from '#lib/server/prisma.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { inviteToJoin } from './mutations';

// Les actions de l'encart « Inscriptions en attente », partagées par les pages FA et Bénévoles

const invitationIdSchema = z.object({ invitationId: z.uuid('Invitation invalide') });

async function readInvitationId(request: Request) {
	return invitationIdSchema.safeParse(Object.fromEntries(await request.formData()));
}

/** Renvoyer : un NOUVEAU lien (14 jours de plus), l'ancien ne marche plus */
export async function resendInvitationAction({ request, locals, url }: RequestEvent) {
	if (!locals.user || !hasAdminRole(locals.user)) {
		return fail(403, { error: 'Action réservée à l’admin' });
	}
	const parsed = await readInvitationId(request);
	if (!parsed.success) return fail(400, { error: 'Invitation invalide' });

	const invitation = await prisma.invitation.findUnique({
		where: { id: parsed.data.invitationId }
	});
	if (!invitation) return fail(404, { error: 'Invitation introuvable (déjà acceptée ?)' });

	// Les mêmes données : inviteToJoin remplace l'invitation (nouveau jeton, nouvelle date)
	const data = invitation.data as Record<string, string | null>;
	const result = await inviteToJoin({
		kind: invitation.kind,
		data,
		email: invitation.email,
		firstName: data.firstName ?? '',
		formId: invitation.formId,
		createdById: locals.user.id,
		origin: url.origin
	});
	if (!result.success) return fail(400, { error: result.error });

	return {
		success: true,
		emailSent: result.emailSent,
		message: result.emailSent
			? `Invitation renvoyée à ${invitation.email}`
			: "Nouveau lien créé, mais l'email n'a pas pu partir"
	};
}

/** Annuler : l'invitation est supprimée, le lien ne marche plus, rien n'est créé */
export async function cancelInvitationAction({ request, locals }: RequestEvent) {
	if (!locals.user || !hasAdminRole(locals.user)) {
		return fail(403, { error: 'Action réservée à l’admin' });
	}
	const parsed = await readInvitationId(request);
	if (!parsed.success) return fail(400, { error: 'Invitation invalide' });

	await prisma.invitation.deleteMany({ where: { id: parsed.data.invitationId } });
	return { success: true, message: 'Invitation annulée' };
}
