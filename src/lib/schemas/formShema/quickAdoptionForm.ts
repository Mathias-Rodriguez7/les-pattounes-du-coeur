import { z } from 'zod';
import { District } from '@prisma/client';

// 🔧 Helper nombres sécurisés
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

// 🧠 BASE
const baseSchema = z.object({
	catId: z.uuid().optional()
});

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

// 👤 STEP 1 - profil adoptant
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

// 🏠 STEP 2 - foyer
export const step2Schema = z.object({
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

// 🔗 FINAL (comme ton ancien form → clean extend)
export const QuickAdoptionFormSchema = z
	.object({
		...baseSchema.shape,
		...step1Schema.shape,
		...step2Schema.shape
	})
	.superRefine((data, ctx) => {
		if (data.hasGarden && (data.gardenSize === undefined || data.gardenSize === null)) {
			ctx.addIssue({
				path: ['gardenSize'],
				code: 'custom',
				message: 'Taille du jardin requise'
			});
		}
	});

export type QuickAdoptionForm = z.infer<typeof QuickAdoptionFormSchema>;
