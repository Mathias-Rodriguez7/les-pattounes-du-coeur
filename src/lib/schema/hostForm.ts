import { z } from 'zod';

//
// ENUMS
//

export const hostTypeEnum = z.enum(['CLASSIC', 'RELAY']);

export const spaceEnum = z.enum(['SMALL', 'MEDIUM', 'LARGE']);

export const healEnum = z.enum(['NO', 'LIGHT', 'HEAVY', 'HEAVY_STING']);

export const socializeEnum = z.enum(['NO', 'FEARFUL', 'WITHOUT_EX', 'EXPERIENCED']);

export const babyFeedingEnum = z.enum(['NO', 'WITHOUT_EX', 'EXPERIENCED', 'RELAY']);

//
// STEP 1 — IDENTITÉ
//

export const hostStep1Schema = z.object({
	firstName: z.string().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().min(1, 'Le nom est obligatoire'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	email: z.email('Email invalide'),
	address: z.string().min(1, "L'adresse est obligatoire"),
	age: z.coerce.number().min(18, 'Vous devez être majeur'),
	job: z.string().min(1, 'Le métier est obligatoire')
});

//
// STEP 2 — LOGEMENT
//

export const hostStep2Schema = z
	.object({
		space: spaceEnum,
		outside: z.boolean(),
		outsideDescription: z.string().optional(),
		hasAnimalsAtHome: z.boolean(),
		numberOfCatsAtHome: z.union([z.coerce.number(), z.nan()]).optional(),
		numberOfDogsAtHome: z.union([z.coerce.number(), z.nan()]).optional(),
		otherAnimalsAtHome: z.string().optional(),
		homeDescription: z.string().min(1, 'La description du foyer est obligatoire')
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
// STEP 3 — EXPÉRIENCE
//

export const hostStep3Schema = z.object({
	type: hostTypeEnum,
	heal: healEnum,
	socialize: socializeEnum,
	car: z.boolean(),
	babyFeeding: babyFeedingEnum
});

//
// STEP 4 — DISPONIBILITÉ
//

export const hostStep4Schema = z.object({
	// 🐱 type de chats acceptés
	canHostAdultCats: z.boolean().default(false),
	canHostKittens: z.boolean().default(false),
	canHostMotherAndKittens: z.boolean().default(false),

	// 🏠 présence dans le foyer
	presenceWeek: z.enum([
		'FULL_TIME_HOME',
		'HOME_HALF_DAY',
		'EVENINGS_ONLY',
		'WEEKENDS_ONLY',
		'OCCASIONAL'
	]),

	// ⏳ engagement
	availabilityDuration: z.enum([
		'LESS_THAN_1_MONTH',
		'1_TO_3_MONTHS',
		'3_TO_6_MONTHS',
		'MORE_THAN_6_MONTHS',
		'LONG_TERM'
	]),

	// 💬 motivation
	motivation: z.string().min(10, 'Merci d’expliquer votre motivation'),

	// 💬 message libre
	additionalMessage: z.string().optional()
});

//
// SCHEMA GLOBAL
//

export const hostFormSchema = hostStep1Schema
	.extend(hostStep2Schema.shape)
	.extend(hostStep3Schema.shape)
	.extend(hostStep4Schema.shape);

//
// TYPES
//

export type HostIdentitySchema = z.infer<typeof hostStep1Schema>;

export type HostHousingSchema = z.infer<typeof hostStep2Schema>;

export type HostExperienceSchema = z.infer<typeof hostStep3Schema>;

export type HostAvailabilitySchema = z.infer<typeof hostStep4Schema>;

export type FormHostSchema = z.infer<typeof hostFormSchema>;
