// src/lib/constants/adoption.ts
import type { AdoptionTone } from '$lib/utils/adoption';
import type { AdoptionStatus, CatStatus } from '@prisma/client';

/** Durée de la période d'essai, en mois (fixée par l'association) */
export const ADOPTION_TRIAL_MONTHS = 6;

export const ADOPTION_STATUS = {
	TRIAL: { label: "Période d'essai", color: 'bg-amber-100 text-amber-800' },
	FINAL: { label: 'Adoption définitive', color: 'bg-green-100 text-green-800' },
	CANCELLED: { label: 'Annulée', color: 'bg-gray-100 text-gray-700' }
} satisfies Record<AdoptionStatus, { label: string; color: string }>;

/** Couleur du nom dans la liste des chats, selon l'état de l'adoption */
export const ADOPTION_TONE = {
	DUE: { label: 'Adoption à finaliser', textClass: 'font-semibold text-red-600' },
	TRIAL: { label: "Adoption en période d'essai", textClass: 'text-amber-700' },
	FINAL: { label: 'Adoption définitive', textClass: 'text-green-700' }
} satisfies Record<AdoptionTone, { label: string; textClass: string }>;

/** Les statuts depuis lesquels un chat peut être adopté.
 * SOCIALIZE aussi : un adoptant expérimenté peut prendre un chat encore en socialisation */
export const ADOPTABLE_STATUSES: readonly CatStatus[] = ['AVAILABLE', 'SOCIALIZE'];
