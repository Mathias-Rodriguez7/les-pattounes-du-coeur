import { z } from 'zod';
import { District } from '@prisma/client';
import { emailField } from '#lib/schemas/fields.ts';
import {
	ADOPTION_TRIAL_DEFAULT_MONTHS,
	ADOPTION_TRIAL_MAX_MONTHS,
	ADOPTION_TRIAL_MIN_MONTHS
} from '#lib/constants/adoption.ts';

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
	// La durée de la période d'essai, choisie par la bénévole
	trialMonths: z.coerce
		.number()
		.int()
		.min(ADOPTION_TRIAL_MIN_MONTHS, `Période d'essai : ${ADOPTION_TRIAL_MIN_MONTHS} mois minimum`)
		.max(ADOPTION_TRIAL_MAX_MONTHS, `Période d'essai : ${ADOPTION_TRIAL_MAX_MONTHS} mois maximum`)
		.default(ADOPTION_TRIAL_DEFAULT_MONTHS),
	// Facultatif : une adoption peut se faire sans demande (adoptant rencontré hors du site).
	// Un champ caché vide arrive comme '' : on le traite comme « pas de demande »
	formId: z
		.union([z.uuid('ID de formulaire invalide'), z.literal('').transform(() => undefined)])
		.optional()
});

// Côté serveur : la même chose, PLUS le contrat (déjà envoyé sur S3 par le navigateur)
export const createAdoptionWithContractSchema = createAdoptionSchema.extend({
	mediaStorageKey: z.string().min(1, 'Le contrat est obligatoire').max(500),
	mediaOriginalName: z.string().max(255).nullish(),
	// Adoptant blacklisté : l'admin coche « J'ai pris connaissance… » pour passer outre
	// (la case envoie 'true' ou 'false' ; absente quand l'adoptant n'est pas blacklisté)
	blacklistOverride: z.enum(['true', 'false']).optional()
});

export const updateAdoptionSchema = createAdoptionSchema.partial().extend({
	adoptionId: z.uuid('ID invalide')
});

// Finaliser : les cases « Stérilisation vérifiée » et « Propriétaire changé sur l'I-CAD »
// sont obligatoires
export const finalizeAdoptionSchema = z.object({
	adoptionId: z.uuid('ID invalide'),
	sterilizationChecked: z.literal('true', 'Confirmez que la stérilisation a été vérifiée'),
	icadChecked: z.literal('true', "Confirmez que le propriétaire a été changé sur l'I-CAD")
});

// Annuler une adoption (retour du chat) : le chat repasse disponible OU en socialisation.
// La raison et le document de retour sont facultatifs.
export const cancelAdoptionSchema = z.object({
	adoptionId: z.uuid('ID invalide'),
	catStatus: z.enum(['AVAILABLE', 'SOCIALIZE'], 'Choisissez le nouveau statut du chat'),
	reason: z
		.string()
		.trim()
		.max(1000, '1000 caractères maximum')
		.optional()
		.transform((value) => value || undefined),
	mediaStorageKey: z
		.string()
		.max(500)
		.optional()
		.transform((value) => value || undefined),
	mediaOriginalName: z.string().max(255).nullish()
});

export type CancelAdoptionInput = z.infer<typeof cancelAdoptionSchema>;

// ✅ Types TypeScript corrects
export type CreateAdoptionInput = z.infer<typeof createAdoptionSchema>;
export type UpdateAdoptionInput = z.infer<typeof updateAdoptionSchema>;
