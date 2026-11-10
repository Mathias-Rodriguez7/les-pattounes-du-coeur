import { z } from 'zod';
import { District } from '@prisma/client';
import { emailField } from '$lib/schemas/fields';

// ✅ Convertir les enums Prisma en arrays pour z.enum()
const districtEnum = z
	.enum(Object.values(District) as [string, ...string[]])
	.transform((val) => val as District);

// ✅ Convertir les strings en dates
const stringToDate = z.string().pipe(z.coerce.date()).nullable().optional();

// schemas/adoption.ts
export const createAdoptionSchema = z.object({
	// PROFIL
	firstName: z.string().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().min(1, 'Le nom est obligatoire'),
	birthDate: stringToDate,
	email: emailField(),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),

	// Adresse
	address: z.string().min(1, "L'adresse est obligatoire"),
	city: z.string().min(1, 'La ville est obligatoire'),
	postalCode: z.string().min(5, 'Code postal invalide'),
	district: districtEnum.nullable().optional(),

	// Adoption
	catId: z.uuid('ID de chat invalide'), // obligatoire pour créer une adoption
	// Facultatif : une adoption peut se faire sans demande (adoptant rencontré hors du site).
	// Un champ caché vide arrive comme '' : on le traite comme « pas de demande »
	formId: z
		.union([z.uuid('ID de formulaire invalide'), z.literal('').transform(() => undefined)])
		.optional()
});

// Côté serveur : la même chose, PLUS le contrat (déjà envoyé sur S3 par le navigateur)
export const createAdoptionWithContractSchema = createAdoptionSchema.extend({
	mediaStorageKey: z.string().min(1, 'Le contrat est obligatoire').max(500),
	mediaOriginalName: z.string().max(255).nullish()
});

export const updateAdoptionSchema = createAdoptionSchema.partial().extend({
	adoptionId: z.uuid('ID invalide')
});

// Finaliser : la case « Stérilisation vérifiée » est obligatoire
export const finalizeAdoptionSchema = z.object({
	adoptionId: z.uuid('ID invalide'),
	sterilizationChecked: z.literal('true', 'Confirmez que la stérilisation a été vérifiée')
});

// ✅ Types TypeScript corrects
export type CreateAdoptionInput = z.infer<typeof createAdoptionSchema>;
export type UpdateAdoptionInput = z.infer<typeof updateAdoptionSchema>;
