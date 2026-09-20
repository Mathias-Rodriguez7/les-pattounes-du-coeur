import { z } from 'zod';
import { District, HostType, Heal, Socialize, BabyFeeding, ColabActivity } from '@prisma/client';

// ✅ Convertir les enums Prisma en arrays pour z.enum()
const districtEnum = z.enum(Object.values(District) as [string, ...string[]]);
const hostTypeEnum = z.enum(Object.values(HostType) as [string, ...string[]]);
const healEnum = z.enum(Object.values(Heal) as [string, ...string[]]);
const socializeEnum = z.enum(Object.values(Socialize) as [string, ...string[]]);
const babyFeedingEnum = z.enum(Object.values(BabyFeeding) as [string, ...string[]]);
const colabiActivityEnum = z.enum(Object.values(ColabActivity) as [string, ...string[]]);

export const createHostSchema = z.object({
	// PROFIL
	firstName: z.string().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().min(1, 'Le nom est obligatoire'),
	email: z.email('Email invalide'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	address: z.string().min(1, "L'adresse est obligatoire"),
	city: z.string().default('Montpellier'),
	postalCode: z.string().default('34000'),
	district: districtEnum.nullable().optional(),

	// HOST
	birthDate: z.string().nullable().optional(),
	type: hostTypeEnum.nullable().optional(),

	actif: colabiActivityEnum.default(ColabActivity.ACTIVE),
	additionalInformation: z.string().optional(),
	hasAnimalsAtHome: z.boolean().default(false),
	numberOfCatsAtHome: z.coerce.number().int().min(0).nullable().optional(),
	numberOfDogsAtHome: z.coerce.number().int().min(0).nullable().optional(),
	otherAnimalsAtHome: z.string().nullable().optional(),
	space: z.coerce.number().int().min(0),
	homeDescription: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
	presence: z.string(),
	outside: z.boolean().default(false),
	outsideDescription: z.string().optional(),
	isStockFeed: z.boolean().default(false),
	heal: healEnum,
	socialize: socializeEnum,
	car: z.boolean().default(false),
	babyFeeding: babyFeedingEnum,
	availabilityDuration: z.string().min(1, 'La durée de disponibilité est obligatoire')
});

export const updateHostSchema = createHostSchema.partial().extend({
	hostId: z.uuid('ID invalide')
});

export type CreateHostInput = z.infer<typeof createHostSchema>;
export type UpdateHostInput = z.infer<typeof updateHostSchema>;
export type HostEditData = UpdateHostInput;
