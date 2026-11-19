import { fail, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import prisma from '#lib/server/prisma.ts';
import { canManageCat } from '#lib/server/permissions/cat.ts';
import { canPublishCats } from '#lib/permissions/publication.ts';
import { optionalText } from '#lib/schemas/place.ts';

// Le circuit de publication : la bénévole du chat propose, l'admin ou une COMMUNICATION valide
// (le chat devient visible et disponible) ou refuse avec un mot. Droits relus en base.

const catIdSchema = z.object({ catId: z.uuid('Chat invalide') });
const refuseSchema = z.object({
	catId: z.uuid('Chat invalide'),
	note: optionalText(500).refine((note) => !!note, 'Dites ce qui manque')
});

async function readForm(request: Request) {
	return Object.fromEntries(await request.formData());
}

/** Les chats qu'on peut proposer : gérés par l'asso, pas encore adoptés */
const IN_CARE = ['AVAILABLE', 'SOCIALIZE'] as const;

/** « Proposer à l'adoption » : la bénévole du chat (ou l'admin) */
export async function requestPublicationAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });
	const parsed = catIdSchema.safeParse(await readForm(request));
	if (!parsed.success) return fail(400, { success: false, error: 'Chat invalide' });
	const { catId } = parsed.data;

	if (!(await canManageCat(user, catId))) {
		return fail(403, { success: false, error: "Vous n'avez pas le droit de proposer ce chat" });
	}
	// Seulement s'il n'est pas déjà visible ni déjà proposé (deux clics : un seul passe)
	const updated = await prisma.cat.updateMany({
		where: {
			id: catId,
			isVisible: false,
			status: { in: [...IN_CARE] },
			publicationRequestedAt: null
		},
		data: {
			publicationRequestedAt: new Date(),
			publicationRequestedById: user.id,
			publicationRefusedAt: null,
			publicationRefusalNote: null
		}
	});
	if (updated.count === 0) {
		return fail(409, { success: false, error: 'Ce chat est déjà visible ou déjà proposé' });
	}
	return { success: true, message: "Proposé à l'adoption : l'équipe communication va valider" };
}

/** Valider : le chat devient visible sur le site, et disponible */
export async function approvePublicationAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!canPublishCats(user?.role)) {
		return fail(403, { success: false, error: 'Réservé à l’admin et à la communication' });
	}
	const parsed = catIdSchema.safeParse(await readForm(request));
	if (!parsed.success) return fail(400, { success: false, error: 'Chat invalide' });

	const updated = await prisma.cat.updateMany({
		where: { id: parsed.data.catId, publicationRequestedAt: { not: null } },
		data: {
			isVisible: true,
			publishedAt: new Date(),
			status: 'AVAILABLE',
			publicationRequestedAt: null,
			publicationRequestedById: null
		}
	});
	if (updated.count === 0) return fail(409, { success: false, error: 'Plus de demande à valider' });
	return { success: true, message: 'Chat publié : il est visible sur le site 🎉' };
}

/** Refuser, avec un mot pour la bénévole (elle pourra le reproposer) */
export async function refusePublicationAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!canPublishCats(user?.role)) {
		return fail(403, { success: false, error: 'Réservé à l’admin et à la communication' });
	}
	const parsed = refuseSchema.safeParse(await readForm(request));
	if (!parsed.success) {
		return fail(400, {
			success: false,
			error: parsed.error.issues[0]?.message ?? 'Erreur de validation',
			errors: { note: [parsed.error.issues[0]?.message ?? 'Erreur'] }
		});
	}

	const updated = await prisma.cat.updateMany({
		where: { id: parsed.data.catId, publicationRequestedAt: { not: null } },
		data: {
			publicationRequestedAt: null,
			publicationRequestedById: null,
			publicationRefusedAt: new Date(),
			publicationRefusalNote: parsed.data.note
		}
	});
	if (updated.count === 0) return fail(409, { success: false, error: 'Plus de demande à refuser' });
	return { success: true, message: 'Demande refusée : la bénévole verra votre mot' };
}
