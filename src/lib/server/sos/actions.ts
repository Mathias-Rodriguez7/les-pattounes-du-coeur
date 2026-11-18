import { fail, type RequestEvent } from '@sveltejs/kit';
import prisma from '#lib/server/prisma.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { canManageCat } from '#lib/server/permissions/cat.ts';
import { canHandleSos, canTakeSos } from '#lib/server/permissions/sos.ts';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';
import {
	assignSosSchema,
	createSosSchema,
	dismissSosSchema,
	linkCatSosSchema,
	sosHelperSchema,
	sosIdSchema,
	updateSosSchema
} from '#lib/schemas/sos.ts';

// Les actions de la page SOS (et le rattachement d'un chat, depuis sa fiche).
// Les droits sont relus en base à chaque fois : jamais ceux envoyés par le navigateur.

async function readForm(request: Request) {
	return Object.fromEntries(await request.formData());
}

const validationError = (error: Parameters<typeof zodFieldErrors>[0]) =>
	fail(400, { success: false, error: 'Erreur de validation', errors: zodFieldErrors(error) });

const sosRightsSelect = {
	id: true,
	status: true,
	handledById: true,
	helpers: { select: { volunteerId: true } }
} as const;

/** Le SOS et ce qu'il faut pour ses droits (la responsable, ses renforts) */
async function loadSos(sosId: string) {
	const sos = await prisma.sos.findUnique({ where: { id: sosId }, select: sosRightsSelect });
	if (!sos) return null;
	const { helpers, ...rest } = sos;
	return { ...rest, helperIds: helpers.map((helper) => helper.volunteerId) };
}

/** Un SOS reçu par téléphone, mail… : celle qui le saisit le traite */
export async function createSosAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = createSosSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);

	const { reportedAt, ...data } = parsed.data;
	const sos = await prisma.sos.create({
		data: {
			...data,
			reportedAt: new Date(reportedAt),
			status: 'IN_PROGRESS',
			handledById: user.id,
			handledAt: new Date()
		},
		select: { id: true }
	});
	return { success: true, sosId: sos.id, message: 'SOS enregistré : vous le traitez' };
}

/** « Je le prends en charge » : le SOS passe en cours, à son nom */
export async function takeSosAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = sosIdSchema.safeParse(await readForm(request));
	if (!parsed.success) return fail(400, { success: false, error: 'SOS invalide' });

	const sos = await loadSos(parsed.data.sosId);
	if (!sos) return fail(404, { success: false, error: 'SOS introuvable' });
	if (!canTakeSos(user, sos)) {
		return fail(409, { success: false, error: 'Ce SOS est déjà pris en charge' });
	}

	// updateMany avec la condition : si une autre bénévole l'a pris entre-temps, rien ne change
	const updated = await prisma.sos.updateMany({
		where: { id: sos.id, status: 'NEW', handledById: null },
		data: { status: 'IN_PROGRESS', handledById: user.id, handledAt: new Date() }
	});
	if (updated.count === 0) {
		return fail(409, { success: false, error: 'Ce SOS vient d’être pris par une autre bénévole' });
	}
	return { success: true, message: 'Vous traitez ce SOS' };
}

/** Compléter : catégorie, lieu (adresse + GPS), situation */
export async function updateSosAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = updateSosSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);

	const { sosId, reportedAt, ...data } = parsed.data;
	const sos = await loadSos(sosId);
	if (!sos) return fail(404, { success: false, error: 'SOS introuvable' });
	if (!canHandleSos(user, sos)) {
		return fail(403, {
			success: false,
			error: 'Seule la bénévole qui traite ce SOS peut le modifier'
		});
	}

	await prisma.sos.update({
		where: { id: sosId },
		data: { ...data, reportedAt: new Date(reportedAt) }
	});
	return { success: true, message: 'SOS mis à jour' };
}

/** Confier le SOS à une autre bénévole (admin) */
export async function assignSosAction({ request, locals }: RequestEvent) {
	if (!hasAdminRole(locals.user)) {
		return fail(403, { success: false, error: 'Action réservée à l’admin' });
	}

	const parsed = assignSosSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);

	const { sosId, volunteerId } = parsed.data;
	const sos = await loadSos(sosId);
	if (!sos) return fail(404, { success: false, error: 'SOS introuvable' });

	await prisma.sos.update({
		where: { id: sosId },
		data: {
			handledById: volunteerId,
			handledAt: new Date(),
			// Un SOS à traiter confié à quelqu'un devient « en cours »
			...(sos.status === 'NEW' && { status: 'IN_PROGRESS' })
		}
	});
	return { success: true, message: 'SOS confié' };
}

/** Classer sans suite (chat décédé, introuvable…) */
export async function dismissSosAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = dismissSosSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);

	const { sosId, dismissReason, dismissNote } = parsed.data;
	const sos = await loadSos(sosId);
	if (!sos) return fail(404, { success: false, error: 'SOS introuvable' });
	if (!canHandleSos(user, sos)) {
		return fail(403, {
			success: false,
			error: 'Seule la bénévole qui traite ce SOS peut le classer'
		});
	}
	if (sos.status === 'CLOSED') {
		return fail(409, {
			success: false,
			error: 'Ce SOS a déjà des chats : il ne peut plus être classé sans suite'
		});
	}

	await prisma.sos.update({
		where: { id: sosId },
		data: { status: 'DISMISSED', dismissReason, dismissNote, closedAt: new Date() }
	});
	return { success: true, message: 'SOS classé sans suite' };
}

/** Rouvrir un SOS classé sans suite par erreur : il repasse en cours */
export async function reopenSosAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = sosIdSchema.safeParse(await readForm(request));
	if (!parsed.success) return fail(400, { success: false, error: 'SOS invalide' });

	const sos = await loadSos(parsed.data.sosId);
	if (!sos || sos.status !== 'DISMISSED') {
		return fail(404, { success: false, error: 'SOS introuvable' });
	}
	if (!canHandleSos(user, sos)) {
		return fail(403, {
			success: false,
			error: 'Seule la bénévole qui traite ce SOS peut le rouvrir'
		});
	}

	await prisma.sos.update({
		where: { id: sos.id },
		data: { status: 'IN_PROGRESS', dismissReason: null, dismissNote: null, closedAt: null }
	});
	return { success: true, message: 'SOS rouvert' };
}

/**
 * Rattacher un chat qui existe déjà à un SOS, depuis la fiche du chat (ou l'en détacher).
 * Il faut pouvoir gérer le chat ET traiter le SOS. Le SOS passe « clôturé ».
 */
export async function linkCatSosAction({ request, locals }: RequestEvent) {
	const user = locals.user;
	if (!user) return fail(401, { success: false, error: 'Non connecté' });

	const parsed = linkCatSosSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);

	const { catId, sosId } = parsed.data;
	if (!(await canManageCat(user, catId))) {
		return fail(403, { success: false, error: "Vous n'avez pas le droit de modifier ce chat" });
	}

	if (!sosId) {
		await prisma.cat.update({ where: { id: catId }, data: { sosId: null } });
		return { success: true, message: 'Chat détaché du SOS' };
	}

	const sos = await loadSos(sosId);
	if (!sos || sos.status === 'DISMISSED') {
		return fail(404, { success: false, error: 'SOS introuvable' });
	}
	if (!canHandleSos(user, sos)) {
		return fail(403, {
			success: false,
			error: 'Seule la bénévole qui traite ce SOS peut y rattacher un chat'
		});
	}

	await prisma.$transaction([
		prisma.cat.update({ where: { id: catId }, data: { sosId } }),
		prisma.sos.update({
			where: { id: sosId },
			data: { status: 'CLOSED', closedAt: new Date() }
		})
	]);
	return { success: true, message: 'Chat rattaché au SOS' };
}

/**
 * Pour createCat : vérifie qu'un chat peut être créé depuis ce SOS.
 * Renvoie le SOS (avec la bénévole qui le traite) ou un message d'erreur.
 */
export async function sosForNewCat(sosId: string, user: NonNullable<App.Locals['user']>) {
	const sos = await loadSos(sosId);
	if (!sos || sos.status === 'DISMISSED') return { ok: false as const, error: 'SOS introuvable' };
	if (!canHandleSos(user, sos)) {
		return {
			ok: false as const,
			error: 'Seules les bénévoles qui traitent ce SOS peuvent créer ses chats'
		};
	}
	return { ok: true as const, sos };
}

/** Ajouter une bénévole en renfort sur un SOS (admin) */
export async function addSosHelperAction({ request, locals }: RequestEvent) {
	if (!hasAdminRole(locals.user)) {
		return fail(403, { success: false, error: 'Action réservée à l’admin' });
	}
	const parsed = sosHelperSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);
	const { sosId, volunteerId } = parsed.data;

	const sos = await loadSos(sosId);
	if (!sos) return fail(404, { success: false, error: 'SOS introuvable' });
	if (sos.handledById === volunteerId) {
		return fail(400, { success: false, error: 'Elle traite déjà ce SOS' });
	}
	const volunteer = await prisma.volunteer.count({ where: { id: volunteerId } });
	if (volunteer === 0) return fail(404, { success: false, error: 'Bénévole introuvable' });

	// Déjà en renfort : rien à faire
	await prisma.sosHelper.upsert({
		where: { sosId_volunteerId: { sosId, volunteerId } },
		create: { sosId, volunteerId },
		update: {}
	});
	return { success: true, message: 'Bénévole ajoutée en renfort' };
}

/** Retirer une bénévole en renfort (admin) */
export async function removeSosHelperAction({ request, locals }: RequestEvent) {
	if (!hasAdminRole(locals.user)) {
		return fail(403, { success: false, error: 'Action réservée à l’admin' });
	}
	const parsed = sosHelperSchema.safeParse(await readForm(request));
	if (!parsed.success) return validationError(parsed.error);
	const { sosId, volunteerId } = parsed.data;

	await prisma.sosHelper.deleteMany({ where: { sosId, volunteerId } });
	return { success: true, message: 'Bénévole retirée du SOS' };
}
