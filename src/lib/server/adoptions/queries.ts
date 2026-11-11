// src/lib/server/adoptions/queries.ts
import type { Prisma } from '@prisma/client';
import prisma from '#lib/server/prisma.ts';
import { todayDateOnly } from '#lib/utils/date.ts';

/**
 * Les adoptions à finaliser : période d'essai terminée (trialEndsAt ≤ aujourd'hui).
 * Même règle que getTrialInfo().isDue, mais en filtre Prisma (utilise l'index [status, trialEndsAt]).
 * Avec volunteerId : seulement les chats de cette bénévole (sa liste de choses à faire).
 */
export function dueAdoptionsWhere(volunteerId?: string): Prisma.AdoptionWhereInput {
	return {
		status: 'TRIAL',
		trialEndsAt: { lte: todayDateOnly() },
		...(volunteerId && { cat: { volunteers: { some: { volunteerId } } } })
	};
}

/** Le nombre affiché dans la sidebar : les adoptions à finaliser parmi MES chats (admin comprise) */
export function countMyDueAdoptions(volunteerId: string): Promise<number> {
	return prisma.adoption.count({ where: dueAdoptionsWhere(volunteerId) });
}
