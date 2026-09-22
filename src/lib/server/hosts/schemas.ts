import { z } from 'zod';
import { District, HostType, Heal, Socialize, BabyFeeding, ColabActivity } from '@prisma/client';

// ✅ Convertir les enums Prisma en arrays pour z.enum()
const districtEnum = z
	.enum(Object.values(District) as [string, ...string[]])
	.transform((val) => val as District);
const hostTypeEnum = z
	.enum(Object.values(HostType) as [string, ...string[]])
	.transform((val) => val as HostType);
const healEnum = z
	.enum(Object.values(Heal) as [string, ...string[]])
	.transform((val) => val as Heal);
const socializeEnum = z
	.enum(Object.values(Socialize) as [string, ...string[]])
	.transform((val) => val as Socialize);
const babyFeedingEnum = z
	.enum(Object.values(BabyFeeding) as [string, ...string[]])
	.transform((val) => val as BabyFeeding);
const colabActivityEnum = z
	.enum(Object.values(ColabActivity) as [string, ...string[]])
	.transform((val) => val as ColabActivity);

// ✅ Convertir les strings en dates
const stringToDate = z.string().pipe(z.coerce.date()).nullable().optional();

// ✅ Convertir les strings en booleans
const stringToBoolean = z.union([z.boolean(), z.string()]).pipe(z.coerce.boolean()).optional();

export const createHostSchema = z.object({
	// Statut
	type: hostTypeEnum.nullable(), // ✅ Cast vers HostType
	actif: colabActivityEnum.default(ColabActivity.ACTIVE), // ✅ Cast vers ColabActivity
	isAvailable: stringToBoolean.default(true),

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
	district: districtEnum.nullable().optional(), // ✅ Cast vers District

	// HOST - Domicile
	space: z.coerce
		.number()
		.int()
		.min(10)
		.positive("L'espace doit être un nombre positif d'au moins 10 m²"),
	outside: stringToBoolean.default(false),
	isStockFeed: stringToBoolean.default(false),
	car: stringToBoolean.default(false),

	// Animaux
	hasAnimalsAtHome: stringToBoolean.default(false),
	numberOfCatsAtHome: z.coerce.number().int().min(0).nullable().optional(),
	numberOfDogsAtHome: z.coerce.number().int().min(0).nullable().optional(),
	otherAnimalsAtHome: z.string().nullable().optional(),

	// Capacités
	heal: healEnum, // ✅ Cast vers Heal
	socialize: socializeEnum, // ✅ Cast vers Socialize
	babyFeeding: babyFeedingEnum, // ✅ Cast vers BabyFeeding

	// Cat
	catAdult: z.coerce.number().int().min(0).default(0),
	kittyAndKitten: z.coerce.boolean().default(false),
	kitten: z.coerce.number().int().min(0).default(0),

	// Descriptions
	homeDescription: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
	presence: z.string().default(''),
	outsideDescription: z.string().optional().nullable(),
	stopActivity: z.string().optional(),
	additionalInformation: z.string().optional().nullable()
});

export const updateHostSchema = createHostSchema.partial().extend({
	hostId: z.uuid('ID invalide')
});

// ✅ Types TypeScript corrects
export type CreateHostInput = z.infer<typeof createHostSchema>;
export type UpdateHostInput = z.infer<typeof updateHostSchema>;
