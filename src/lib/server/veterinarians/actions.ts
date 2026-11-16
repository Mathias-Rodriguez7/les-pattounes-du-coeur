import { fail, type RequestEvent } from '@sveltejs/kit';
import prisma from '#lib/server/prisma.ts';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';
import { zodFieldErrors } from '#lib/utils/zodErrors.ts';
import {
	setVeterinarianActiveSchema,
	updateVeterinarianSchema,
	veterinarianSchema
} from '#lib/schemas/veterinarian.ts';

// Les actions de la page Vétérinaires : réservées à l'admin.
// On ne supprime pas un vétérinaire : on le RETIRE de la liste (isActive = false).
// Il n'est plus proposé dans les soins, mais les soins passés gardent son nom.

async function readForm(request: Request) {
	return Object.fromEntries(await request.formData());
}

const notAdmin = () => fail(403, { success: false, error: 'Action réservée à l’admin' });

export async function createVeterinarianAction({ request, locals }: RequestEvent) {
	if (!hasAdminRole(locals.user)) return notAdmin();

	const parsed = veterinarianSchema.safeParse(await readForm(request));
	if (!parsed.success) {
		return fail(400, {
			success: false,
			error: 'Erreur de validation',
			errors: zodFieldErrors(parsed.error)
		});
	}

	await prisma.veterinarian.create({ data: parsed.data });
	return { success: true, message: `${parsed.data.name} ajouté à la liste` };
}

export async function updateVeterinarianAction({ request, locals }: RequestEvent) {
	if (!hasAdminRole(locals.user)) return notAdmin();

	const parsed = updateVeterinarianSchema.safeParse(await readForm(request));
	if (!parsed.success) {
		return fail(400, {
			success: false,
			error: 'Erreur de validation',
			errors: zodFieldErrors(parsed.error)
		});
	}

	const { veterinarianId, ...data } = parsed.data;
	const updated = await prisma.veterinarian.updateMany({ where: { id: veterinarianId }, data });
	if (updated.count === 0) return fail(404, { success: false, error: 'Vétérinaire introuvable' });

	return { success: true, message: `${data.name} modifié` };
}

/** Retirer de la liste, ou y remettre */
export async function setVeterinarianActiveAction({ request, locals }: RequestEvent) {
	if (!hasAdminRole(locals.user)) return notAdmin();

	const parsed = setVeterinarianActiveSchema.safeParse(await readForm(request));
	if (!parsed.success) return fail(400, { success: false, error: 'Données invalides' });

	const { veterinarianId, isActive } = parsed.data;
	const updated = await prisma.veterinarian.updateMany({
		where: { id: veterinarianId },
		data: { isActive }
	});
	if (updated.count === 0) return fail(404, { success: false, error: 'Vétérinaire introuvable' });

	return {
		success: true,
		message: isActive ? 'Vétérinaire remis dans la liste' : 'Vétérinaire retiré de la liste'
	};
}
