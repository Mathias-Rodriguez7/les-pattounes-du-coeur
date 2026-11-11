import { fail, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { addToBlacklistSchema, liftBlacklistSchema } from '#lib/schemas/blacklist.ts';
import { addToBlacklist, liftBlacklist, BlacklistError } from './mutations.ts';

// =====================================================================
// Actions PARTAGÉES : chaque page qui affiche un bouton « liste noire » les déclare
// dans son `actions` (comme createAdoptionAction).
// Pourquoi pas une seule action sur /dashboard/liste-noire ? Depuis SvelteKit 3,
// un formulaire `use:enhance` qui envoie vers une AUTRE page navigue vers elle :
// l'admin quitterait la fiche du chat ou de la demande.
// =====================================================================

type ActionEvent = Pick<RequestEvent, 'request' | 'locals'>;

/** Réservé à l'admin : la décision vient TOUJOURS du serveur, jamais du navigateur */
function adminName(locals: App.Locals): string | null {
	const user = locals.user;
	if (!user || user.role !== 'ADMIN') return null;
	return `${user.profil.firstName} ${user.profil.lastName}`;
}

async function parse<T extends z.ZodType>(request: Request, schema: T) {
	const formData = Object.fromEntries(await request.formData());
	return schema.safeParse(formData);
}

export async function addToBlacklistAction({ request, locals }: ActionEvent) {
	if (!adminName(locals)) {
		return fail(403, { error: "Seule l'administratrice peut mettre sur liste noire" });
	}

	const parsed = await parse(request, addToBlacklistSchema);
	if (!parsed.success) {
		return fail(400, {
			error: 'Vérifiez les champs',
			errors: z.flattenError(parsed.error).fieldErrors
		});
	}

	try {
		await addToBlacklist(parsed.data);
		return { success: true, message: `${parsed.data.email} est sur liste noire` };
	} catch (e) {
		if (e instanceof BlacklistError) return fail(409, { error: e.message });
		console.error('Erreur mise en liste noire :', e);
		return fail(500, { error: 'Erreur lors de la mise en liste noire' });
	}
}

export async function liftBlacklistAction({ request, locals }: ActionEvent) {
	const liftedBy = adminName(locals);
	if (!liftedBy) {
		return fail(403, { error: "Seule l'administratrice peut lever une liste noire" });
	}

	const parsed = await parse(request, liftBlacklistSchema);
	if (!parsed.success) {
		return fail(400, {
			error: 'Vérifiez les champs',
			errors: z.flattenError(parsed.error).fieldErrors
		});
	}

	try {
		await liftBlacklist(parsed.data, liftedBy);
		return { success: true, message: 'Liste noire levée' };
	} catch (e) {
		if (e instanceof BlacklistError) return fail(409, { error: e.message });
		console.error('Erreur levée de liste noire :', e);
		return fail(500, { error: 'Erreur lors de la levée' });
	}
}
