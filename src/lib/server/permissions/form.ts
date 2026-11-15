// src/lib/server/permissions/form.ts
import type { FormType, Prisma } from '@prisma/client';
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

type AssignableForm = { type: FormType; assignedToId: string | null };

/**
 * Ce qu'une personne peut faire de l'attribution d'une demande :
 * - canReassign : choisir n'importe quelle bénévole (ou « personne »).
 *   L'admin, pour toutes les demandes ; la bénévole qui a la demande LIBRE, pour la passer
 *   à une autre si les chats qu'elle propose ne conviennent pas (ou la libérer).
 * - canTake : se l'attribuer à elle-même. Toute bénévole, pour une demande LIBRE à personne.
 * Les demandes précises restent à la bénévole du chat (ou à l'admin).
 */
export function assignRights(user: AppUser, form: AssignableForm) {
	if (hasAdminRole(user)) return { canReassign: true, canTake: false };
	const isFlexible = form.type === 'ADOPTION_FLEXIBLE';
	return {
		canReassign: isFlexible && form.assignedToId === user.id,
		canTake: isFlexible && form.assignedToId === null
	};
}

/** Le serveur : cette attribution (à `targetId`, ou à personne si null) est-elle permise ? */
export function canAssignForm(
	user: AppUser,
	form: AssignableForm,
	targetId: string | null
): boolean {
	const { canReassign, canTake } = assignRights(user, form);
	return canReassign || (canTake && targetId === user.id);
}
