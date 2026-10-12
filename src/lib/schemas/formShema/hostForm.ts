import { z } from 'zod';
import { District, HostType, Heal, Socialize, BabyFeeding } from '@prisma/client';

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

// ✅ Convertir les strings en dates
const stringToDate = z.string().pipe(z.coerce.date()).nullable().optional();

// ✅ Convertir les strings en booleans
const stringToBoolean = z.union([z.boolean(), z.string()]).pipe(z.coerce.boolean()).optional();

//
// STEP 1 — IDENTITÉ
//

export const hostStep1Schema = z.object({
	firstName: z.string().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().min(1, 'Le nom est obligatoire'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	email: z.email('Email invalide'),
	address: z.string().min(1, "L'adresse est obligatoire"),
	birthDate: stringToDate,
	city: z.string().min(1, 'La ville est obligatoire'),
	postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
	district: districtEnum.nullable().optional()
});

//
// STEP 2 — LOGEMENT
//

export const hostStep2Schema = z.object({
	space: z.coerce
		.number()
		.int()
		.min(10)
		.positive("L'espace doit être un nombre positif d'au moins 10 m²"),
	outside: stringToBoolean.default(false),
	outsideDescription: z.string().optional().nullable(),
	hasAnimalsAtHome: stringToBoolean.default(false),
	numberOfCatsAtHome: z.coerce.number().int().min(0).nullable().optional(),
	numberOfDogsAtHome: z.coerce.number().int().min(0).nullable().optional(),
	otherAnimalsAtHome: z.string().nullable().optional(),
	homeDescription: z.string().min(10, 'La description doit contenir au moins 10 caractères')
});

//
// STEP 3 — EXPÉRIENCE
//

export const hostStep3Schema = z.object({
	type: hostTypeEnum.nullable(),
	heal: healEnum,
	socialize: socializeEnum,
	car: stringToBoolean.default(false),
	babyFeeding: babyFeedingEnum
});

//
// STEP 4 — DISPONIBILITÉ
//

export const hostStep4Schema = z.object({
	// 🐱 type de chats acceptés
	catAdult: z.coerce.number().int().min(0).default(0),
	kittyAndKitten: z.coerce.boolean().default(false),
	kitten: z.coerce.number().int().min(0).default(0),

	// 🏠 présence dans le foyer
	presence: z.string().default(''),

	// 💬 motivation
	motivation: z.string().min(10, 'Merci d’expliquer votre motivation'),

	// 💬 message libre
	additionalMessage: z.string().optional()
});

//
// SCHEMA GLOBAL
//

export const hostFormSchema = z
	.object({
		...hostStep1Schema.shape,
		...hostStep2Schema.shape,
		...hostStep3Schema.shape,
		...hostStep4Schema.shape
	})
	.superRefine((data, ctx) => {
		// VALIDATION OUTSIDE
		if (data.outside && !data.outsideDescription?.trim()) {
			ctx.addIssue({
				code: 'custom',
				path: ['outsideDescription'],
				message: "Veuillez décrire l'accès extérieur"
			});
		}

		// VALIDATION ANIMAUX
		if (!data.hasAnimalsAtHome) return;

		if ((data.numberOfCatsAtHome ?? 0) < 0) {
			ctx.addIssue({
				code: 'custom',
				path: ['numberOfCatsAtHome'],
				message: 'Le nombre de chats doit être positif'
			});
		}

		if ((data.numberOfDogsAtHome ?? 0) < 0) {
			ctx.addIssue({
				code: 'custom',
				path: ['numberOfDogsAtHome'],
				message: 'Le nombre de chiens doit être positif'
			});
		}
	});
//
// TYPES
//

export type HostIdentitySchema = z.infer<typeof hostStep1Schema>;

export type HostHousingSchema = z.infer<typeof hostStep2Schema>;

export type HostExperienceSchema = z.infer<typeof hostStep3Schema>;

export type HostAvailabilitySchema = z.infer<typeof hostStep4Schema>;

export type FormHostSchema = z.infer<typeof hostFormSchema>;
