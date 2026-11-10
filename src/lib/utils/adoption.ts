// src/lib/utils/adoption.ts
import type { AdoptionStatus } from '@prisma/client';
import { todayDateOnly } from './date';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Où en est la période d'essai ? Un seul calcul, partagé par la fiche du chat,
 * la liste des chats et le badge de la sidebar.
 * - daysLeft : jours avant la fin de l'essai (0 = aujourd'hui, négatif = dépassé)
 * - isDue : essai terminé, l'adoption attend d'être finalisée
 */
export function getTrialInfo(
	adoption: { status: AdoptionStatus; trialEndsAt: Date },
	today: Date = todayDateOnly()
): { daysLeft: number; isDue: boolean } {
	const daysLeft = Math.round(
		(new Date(adoption.trialEndsAt).getTime() - today.getTime()) / DAY_MS
	);
	return { daysLeft, isDue: adoption.status === 'TRIAL' && daysLeft <= 0 };
}

/** L'état d'adoption à signaler dans une liste : à finaliser, en essai, définitive (ou rien) */
export type AdoptionTone = 'DUE' | 'TRIAL' | 'FINAL';

/**
 * L'adoption EN COURS d'un chat adopté (la plus récente), et son état pour l'affichage.
 * Les adoptions du chat arrivent triées par date décroissante (catFullArgs).
 */
export function getAdoptionTone(cat: {
	status: string;
	adoptions?: { status: AdoptionStatus; trialEndsAt: Date }[];
}): AdoptionTone | null {
	const adoption = cat.status === 'ADOPTED' ? cat.adoptions?.[0] : undefined;
	if (!adoption || adoption.status === 'CANCELLED') return null;
	if (adoption.status === 'FINAL') return 'FINAL';
	return getTrialInfo(adoption).isDue ? 'DUE' : 'TRIAL';
}
