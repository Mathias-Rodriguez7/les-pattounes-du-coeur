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

// 👤 STEP 1
export const step1Schema = z.object({
	firstName: z.string().trim().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().trim().min(1, 'Le nom est obligatoire'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	email: z.email('Email invalide'),
	address: z.string().trim().min(1, "L'adresse est obligatoire"),
	birthDate: adultBirthDate,
	city: z.string().trim().min(1, 'La ville est obligatoire'),
	postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
	district: z.enum(District).nullable().optional()
});

// 🐱 STEP 2
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

// 🏠 STEP 3
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

// 🔗 GLOBAL SCHEMA
export const adoptionFormSchema = z
	.object({
		...step1Schema.shape,
		...step2Schema.shape,
		...step3Schema.shape
	})
	.superRefine((data, ctx) => {
		if (data.hasGarden && data.gardenSize === undefined) {
			ctx.addIssue({
				path: ['gardenSize'],
				code: 'custom',
				message: 'Veuillez indiquer la taille du jardin'
			});
		}
	});

export type AdoptionForm = z.infer<typeof adoptionFormSchema>;
