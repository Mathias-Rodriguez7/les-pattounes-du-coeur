import { z } from 'zod';
import { District, VolunteerRole, ColabActivity } from '@prisma/client';

// ✅ Convertir les enums Prisma en arrays pour z.enum()
const districtEnum = z
	.enum(Object.values(District) as [string, ...string[]])
	.transform((val) => val as District);
const colabActivityEnum = z
	.enum(Object.values(ColabActivity) as [string, ...string[]])
	.transform((val) => val as ColabActivity);
const roleEnum = z
	.enum(Object.values(VolunteerRole) as [string, ...string[]])
	.transform((val) => val as VolunteerRole);

// ✅ Convertir les strings en dates
const stringToDate = z.string().pipe(z.coerce.date()).nullable().optional();

// ✅ Schéma de création
export const createVolunteerSchema = z.object({
	role: roleEnum,
	actif: colabActivityEnum.default(ColabActivity.ACTIVE),
	breakStart: stringToDate.optional(),
	breakEnd: stringToDate.optional(),

	// PROFIL
	firstName: z.string().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().min(1, 'Le nom est obligatoire'),
	birthDate: stringToDate,
	email: z.email('Email invalide'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),

	// Adresse
	address: z.string().min(1, "L'adresse est obligatoire"),
	city: z.string().min(1, 'La ville est obligatoire'),
	postalCode: z.string().min(5, 'Code postal invalide'),
	district: districtEnum.nullable().optional()
});

// ✅ Schéma de mise à jour (tout optionnel sauf l'ID)
export const updateVolunteerSchema = createVolunteerSchema.partial().extend({
	volunteerId: z.uuid('ID invalide')
});

// ✅ Schéma de suppression
export const deleteVolunteerSchema = z.object({
	volunteerId: z.string().uuid('ID invalide')
});

// ✅ Types TypeScript générés
export type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;
export type DeleteVolunteerInput = z.infer<typeof deleteVolunteerSchema>;
