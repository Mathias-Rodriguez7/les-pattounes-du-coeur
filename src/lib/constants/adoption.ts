// src/lib/constants/adoption.ts
import type { AdoptionStatus } from '@prisma/client';

/** Durée de la période d'essai, en mois (fixée par l'association) */
export const ADOPTION_TRIAL_MONTHS = 6;

export const ADOPTION_STATUS = {
	TRIAL: { label: "Période d'essai", color: 'bg-amber-100 text-amber-800' },
	FINAL: { label: 'Adoption définitive', color: 'bg-green-100 text-green-800' },
	CANCELLED: { label: 'Annulée', color: 'bg-gray-100 text-gray-700' }
} satisfies Record<AdoptionStatus, { label: string; color: string }>;
