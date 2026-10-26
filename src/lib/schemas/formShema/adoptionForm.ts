import { z } from 'zod';
import { District } from '@prisma/client';

// 🔧 Helpers
const optionalString = (min = 1, msg?: string) =>
	z.preprocess(
		(v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
		z.string().trim().min(min, msg).optional()
	);

const optionalNumber = (min: number, max: number) =>
	z.preprocess(
		(v) => (v === '' || v === null ? undefined : v),
		z.coerce.number().min(min).max(max).optional()
	);

// 📅 Date de naissance : accepte string ou Date, exige la majorité
const adultBirthDate = z
	.union([z.string().min(1, 'La date de naissance est obligatoire'), z.date()], {
		message: 'La date de naissance est obligatoire'
	})
	.pipe(z.coerce.date({ message: 'Date de naissance invalide' }))
	.refine(
		(d) => {
			const today = new Date();
			let age = today.getFullYear() - d.getFullYear();
			const hadBirthday =
				today.getMonth() > d.getMonth() ||
				(today.getMonth() === d.getMonth() && today.getDate() >= d.getDate());
			if (!hadBirthday) age--;
			return age >= 18;
		},
		{ message: 'Vous devez être majeur' }
	);

//
// STEP 1
//
export const step1Schema = z.object({
	firstName: z.string().trim().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().trim().min(1, 'Le nom est obligatoire'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	email: z.email('Email invalide'),
	address: z.string().trim().min(1, "L'adresse est obligatoire"),
	birthDate: adultBirthDate,
	city: z.string().trim().min(1, 'La ville est obligatoire'),
	postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
	district: z
		.enum(Object.values(District) as [string, ...string[]])
		.nullable()
		.optional()
});

//
// STEP 2
//
export const step2Schema = z.object({
	catAge: z
		.enum(['kitten', 'adult', 'senior', 'free'], {
			message: "Veuillez sélectionner l'âge du chat"
		})
		.default('free'),
	catSex: z
		.enum(['male', 'female', 'free'], {
			message: 'Veuillez sélectionner le sexe du chat'
		})
		.default('free'),
	color: optionalString(2, 'Veuillez indiquer une couleur'),
	furLength: z
		.enum(['short', 'medium', 'long', 'free'], {
			message: 'Veuillez sélectionner la longueur du poil'
		})
		.default('free'),
	temperament: z.string().trim().min(5, 'Le caractère doit contenir au moins 5 caractères')
});

//
// STEP 3
//
export const step3Schema = z.object({
	housingSize: z.coerce
		.number({ message: 'La taille du logement doit être un nombre' })
		.min(10, 'La taille doit être supérieure à 10 m²')
		.max(1000, 'Valeur trop élevée'),
	hasGarden: z.boolean(),
	gardenSize: optionalNumber(1, 10000),
	hasPets: z.boolean(),
	numberOfCats: z.coerce.number({ message: 'Nombre invalide' }).int().min(0).default(0),
	numberOfDogs: z.coerce.number({ message: 'Nombre invalide' }).int().min(0).default(0),
	otherPets: optionalString(),
	numberOfChildren: z.coerce.number({ message: "Nombre d'enfants invalide" }).int().min(0)
});

//
// REFINEMENTS LOGIC
//

const adoptionFormRefinements = (data: any, ctx: any) => {
	if (data.hasGarden && data.gardenSize === undefined) {
		ctx.addIssue({
			path: ['gardenSize'],
			code: 'custom',
			message: 'Veuillez indiquer la taille du jardin'
		});
	}
};

//
// GLOBAL SCHEMA (sans superRefine ici !)
//

export const adoptionFormSchemaBase = z.object({
	...step1Schema.shape,
	...step2Schema.shape,
	...step3Schema.shape
});

export const adoptionFormSchema = adoptionFormSchemaBase.superRefine(adoptionFormRefinements);

//
// TYPES
//

export type AdoptionIdentitySchema = z.infer<typeof step1Schema>;

export type AdoptionCatSchema = z.infer<typeof step2Schema>;

export type AdoptionHousingSchema = z.infer<typeof step3Schema>;

export type AdoptionForm = z.infer<typeof adoptionFormSchema>;

//
// UPDATE SCHEMA (partial + refinements)
//

//
// UPDATE SCHEMA
//

export const updateAdoptionFormSchema = z
	.object({
		// Champs optionnels de step 1
		firstName: optionalString(1, 'Le prénom est obligatoire'),
		lastName: optionalString(1, 'Le nom est obligatoire'),
		phone: z
			.string()
			.regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide')
			.optional()
			.nullable(),
		email: z.string().email('Email invalide').optional().nullable(),
		address: optionalString(1, "L'adresse est obligatoire"),
		birthDate: adultBirthDate.optional(),
		city: optionalString(1, 'La ville est obligatoire'),
		postalCode: z
			.string()
			.regex(/^\d{5}$/, 'Code postal invalide')
			.optional()
			.nullable(),
		district: z
			.enum(Object.values(District) as [string, ...string[]])
			.nullable()
			.optional(),

		// Champs optionnels de step 2
		catAge: z.enum(['kitten', 'adult', 'senior', 'free']).optional(),
		catSex: z.enum(['male', 'female', 'free']).optional(),
		color: optionalString(2, 'Veuillez indiquer une couleur'),
		furLength: z.enum(['short', 'medium', 'long', 'free']).optional(),
		temperament: optionalString(5, 'Le caractère doit contenir au moins 5 caractères'),

		// Champs optionnels de step 3
		housingSize: optionalNumber(10, 1000),
		hasGarden: z.boolean().optional(),
		gardenSize: optionalNumber(1, 10000),
		hasPets: z.boolean().optional(),
		numberOfCats: z.coerce.number().int().min(0).optional(),
		numberOfDogs: z.coerce.number().int().min(0).optional(),
		otherPets: optionalString(),
		numberOfChildren: z.coerce.number().int().min(0).optional(),

		// Champs additionnels
		formId: z.uuid('ID invalide'),
		status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
		notes: optionalString().nullable(), // ✅ Utilise optionalString
		assignedToId: z.uuid('ID invalide').optional().nullable(),

		catId: z.uuid('ID de chat invalide').optional().nullable()
	})
	.superRefine(adoptionFormRefinements);

export type UpdateAdoptionFormInput = z.infer<typeof updateAdoptionFormSchema>;
