import { z } from 'zod';

// 🔧 Helper pour sécuriser les nombres (évite NaN)
const numberField = (label: string) =>
	z.coerce.number().refine((val) => !isNaN(val), {
		message: `${label} doit être un nombre`
	});

// 👤 STEP 1
export const step1Schema = z.object({
	firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),

	lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),

	address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),

	phone: z.string().min(10, 'Numéro de téléphone invalide'),

	email: z.email("L'adresse email n'est pas valide"),

	age: numberField("L'âge").min(18, 'Vous devez avoir au moins 18 ans').max(100, 'Âge invalide')
});

// 🐱 STEP 2
export const step2Schema = z.object({
	catAge: z.enum(['kitten', 'adult', 'senior', 'free'], {
		message: 'Veuillez sélectionner l’âge du chat'
	}),

	catSex: z.enum(['male', 'female', 'free'], {
		message: 'Veuillez sélectionner le sexe du chat'
	}),

	color: z.string().min(2, 'Veuillez indiquer une couleur'),

	furLength: z.enum(['short', 'medium', 'long', 'free'], {
		message: 'Veuillez sélectionner la longueur du poil'
	}),

	temperament: z.string().min(5, 'Le caractère doit contenir au moins 5 caractères')
});

// 🏠 STEP 3
export const step3Schema = z.object({
	housingSize: numberField('La taille du logement')
		.min(10, 'La taille doit être supérieure à 10 m²')
		.max(1000, 'Valeur trop élevée'),

	hasGarden: z.boolean(),
	gardenSize: numberField('La taille du jardin').min(0).max(1000).optional(),

	hasPets: z.boolean(),

	numberOfCats: numberField('Nombre de chats').min(0).default(0),
	numberOfDogs: numberField('Nombre de chiens').min(0).default(0),
	otherPets: z.string().optional(),

	numberOfChildren: numberField("Nombre d'enfants").min(0)
});

// 🔗 GLOBAL SCHEMA
export const adoptionFormSchema = step1Schema
	.extend(step2Schema.shape)
	.extend(step3Schema.shape)
	.superRefine((data, ctx) => {
		if (data.hasGarden && (data.gardenSize === undefined || data.gardenSize === null)) {
			ctx.addIssue({
				path: ['gardenSize'],
				code: 'custom',
				message: 'Veuillez indiquer la taille du jardin'
			});
		}
	});

// 🧠 TYPE TS
export type AdoptionForm = z.infer<typeof adoptionFormSchema>;
