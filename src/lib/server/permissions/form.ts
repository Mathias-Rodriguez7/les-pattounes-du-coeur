// src/lib/server/permissions/form.ts
import type { Prisma } from '@prisma/client';
import type { AppUser } from '$lib/types/user';
import { canManageCat } from './cat';

/**
 * Peut voir et traiter une demande : admin, bénévole assignée,
 * ou bénévole du chat concerné.
 */
export async function canManageForm(
	user: AppUser,
	form: { assignedToId: string | null; catId: string | null }
): Promise<boolean> {
	if (user.role === 'ADMIN') return true;
	if (form.assignedToId === user.id) return true;
	return form.catId !== null && (await canManageCat(user, form.catId));
}

/** La même règle, sous forme de filtre Prisma : pour lister les demandes d'une bénévole */
export function managedFormsWhere(user: AppUser): Prisma.FormWhereInput {
	if (user.role === 'ADMIN') return {};
	return {
		OR: [{ assignedToId: user.id }, { cat: { volunteers: { some: { volunteerId: user.id } } } }]
	};
}
