// src/lib/server/volunteers/schema.ts
import { z } from 'zod';
import { District, VolunteerRole, ColabActivity } from '@prisma/client';

// ✅ Schéma de création
export const createVolunteerSchema = z.object({
	firstName: z
		.string()
		.min(2, 'Le prénom doit contenir au moins 2 caractères')
		.max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
	lastName: z
		.string()
		.min(2, 'Le nom doit contenir au moins 2 caractères')
		.max(50, 'Le nom ne peut pas dépasser 50 caractères'),
	email: z.string().email('Email invalide').max(100, 'Email trop long'),
	phone: z
		.string()
		.regex(/^\+?[0-9\s\-()]{10,}$/, 'Numéro de téléphone invalide')
		.max(20),
	address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères").max(100),
	city: z.string().min(2, 'La ville doit contenir au moins 2 caractères').max(50),
	postalCode: z.string().regex(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres)'),
	district: z
		.enum(Object.values(District) as [string, ...string[]])
		.optional()
		.nullable(),
	role: z.enum(Object.values(VolunteerRole) as [string, ...string[]]).default('MANAGER')
});

// ✅ Schéma de mise à jour (tout optionnel sauf l'ID)
export const updateVolunteerSchema = z.object({
	volunteerId: z.string().uuid('ID invalide'),
	firstName: z
		.string()
		.min(2, 'Le prénom doit contenir au moins 2 caractères')
		.max(50)
		.optional()
		.nullable(),
	lastName: z
		.string()
		.min(2, 'Le nom doit contenir au moins 2 caractères')
		.max(50)
		.optional()
		.nullable(),
	email: z.string().email('Email invalide').max(100).optional().nullable(),
	phone: z
		.string()
		.regex(/^\+?[0-9\s\-()]{10,}$/, 'Numéro de téléphone invalide')
		.max(20)
		.optional()
		.nullable(),
	address: z
		.string()
		.min(5, "L'adresse doit contenir au moins 5 caractères")
		.max(100)
		.optional()
		.nullable(),
	city: z
		.string()
		.min(2, 'La ville doit contenir au moins 2 caractères')
		.max(50)
		.optional()
		.nullable(),
	postalCode: z
		.string()
		.regex(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres)')
		.optional()
		.nullable(),
	district: z
		.enum(Object.values(District) as [string, ...string[]])
		.optional()
		.or(z.literal('')),
	role: z
		.enum(Object.values(VolunteerRole) as [string, ...string[]])
		.optional()
		.nullable(),
	actif: z
		.enum(Object.values(ColabActivity) as [string, ...string[]])
		.optional()
		.nullable()
});

// ✅ Schéma de suppression
export const deleteVolunteerSchema = z.object({
	volunteerId: z.string().uuid('ID invalide')
});

// ✅ Types TypeScript générés
export type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;
export type DeleteVolunteerInput = z.infer<typeof deleteVolunteerSchema>;
