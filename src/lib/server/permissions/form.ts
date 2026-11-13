// src/lib/server/permissions/form.ts
import type { Prisma } from '@prisma/client';
import type { AppUser } from '#lib/types/user.ts';
import { canManageCat } from './cat';
import { hasAdminRole } from '#lib/server/permissions/roles.ts';

/**
 * Peut voir et traiter une demande : admin, bénévole assignée,
 * ou bénévole du chat concerné.
 */
export async function canManageForm(
	user: AppUser,
	form: { assignedToId: string | null; catId: string | null }
): Promise<boolean> {
	if (hasAdminRole(user)) return true;
	if (form.assignedToId === user.id) return true;
	return form.catId !== null && (await canManageCat(user, form.catId));
}

/**
 * « Mes demandes » : assignées à cette personne, ou concernant un de ses chats.
 * Sans exception pour l'admin : c'est sa vue personnelle.
 */
export function myFormsWhere(userId: string): Prisma.FormWhereInput {
	return {
		OR: [{ assignedToId: userId }, { cat: { volunteers: { some: { volunteerId: userId } } } }]
	};
}
