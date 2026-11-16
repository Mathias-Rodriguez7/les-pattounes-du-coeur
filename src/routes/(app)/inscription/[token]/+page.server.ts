import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { acceptInvitation, findValidInvitation } from '#lib/server/invitations/mutations.ts';
import { currentCharter } from '#lib/server/invitations/charters.ts';
import { SignupError } from '#lib/server/invitations/errors.ts';
import { newPasswordSchema } from '#lib/schemas/password.ts';
import { startSession } from '#lib/server/sessions.ts';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';

// =====================================================================
// La page du lien de l'email : lire le document, l'accepter (+ mot de passe pour une bénévole).
// Page PUBLIQUE : c'est le jeton du lien qui donne le droit d'être ici.
// =====================================================================

export const load: PageServerLoad = async ({ params }) => {
	const invitation = await findValidInvitation(params.token);
	const charter = invitation ? await currentCharter(invitation.kind) : null;

	// Lien inconnu, expiré, ou document retiré : même message, sans dire lequel
	if (!invitation || !charter) return { status: 'invalid' as const };

	const { firstName } = invitation.data as { firstName?: string };
	return {
		status: 'ready' as const,
		kind: invitation.kind,
		firstName: firstName ?? '',
		charter: { id: charter.id, title: charter.title }
	};
};

const acceptSchema = z.object({
	documentId: z.uuid('Document invalide'),
	accepted: z.literal('true', { message: 'Cochez la case pour accepter le document' })
});

export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const form = Object.fromEntries(await request.formData());

		const invitation = await findValidInvitation(params.token);
		if (!invitation) {
			return fail(400, { error: "Ce lien n'est plus valable." });
		}

		// La case, et pour une bénévole le mot de passe (mêmes règles que le Profil)
		const accept = acceptSchema.safeParse(form);
		const password = invitation.kind === 'VOLUNTEER' ? newPasswordSchema.safeParse(form) : null;
		if (!accept.success || (password && !password.success)) {
			return fail(400, {
				error: 'Vérifiez le formulaire',
				errors: {
					...(accept.success ? {} : zodFieldErrors(accept.error)),
					...(password && !password.success ? zodFieldErrors(password.error) : {})
				}
			});
		}

		let result;
		try {
			result = await acceptInvitation(params.token, {
				documentId: accept.data.documentId,
				password: password?.success ? password.data.newPassword : undefined
			});
		} catch (error) {
			// Un message écrit pour elle (« Le document a été mis à jour… ») : on l'affiche
			if (error instanceof SignupError) return fail(400, { error: error.message });
			throw error;
		}

		// Bénévole : son compte existe, elle arrive connectée sur son tableau de bord
		if (result.volunteerId) {
			await startSession(cookies, result.volunteerId);
			redirect(303, '/dashboard');
		}

		// FA : pas de compte, juste un merci. Son prénom part avec la réponse : juste après,
		// SvelteKit recharge la page, et l'invitation (supprimée) ne le fournit plus
		const { firstName } = invitation.data as { firstName?: string };
		return { success: true, firstName: firstName ?? '' };
	}
};
