// src/lib/schemas/care.ts
import { z } from 'zod';
import { CareType } from '@prisma/client';

// Un champ vide envoyé par un formulaire ('') devient null
const emptyToNull = (value: unknown) => (value === '' ? null : value);

export const createCareSchema = z.object({
	catId: z.string().uuid(),
	type: z.enum(CareType),
	// Format "AAAA-MM-JJ", celui que renvoie le DatePicker
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),

	// Obligatoire : le motif de la visite
	reason: z.string().trim().min(1, 'Le motif est obligatoire').max(2000, 'Max 2 000 caractères'),

	// Facultatifs : '' → null
	veterinary: z.preprocess(emptyToNull, z.string().trim().max(255, 'Max 255 caractères').nullish()),
	description: z.preprocess(
		emptyToNull,
		z.string().trim().max(2000, 'Max 2 000 caractères').nullish()
	),
	// « Aucune » dans le select envoie '' : sans emptyToNull, ce serait refusé (pas un uuid)
	sicknessId: z.preprocess(emptyToNull, z.string().uuid().nullish())
});

export type CreateCareInput = z.infer<typeof createCareSchema>;
