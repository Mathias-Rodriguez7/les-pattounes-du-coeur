import { z } from 'zod';

// 🔧 Helper nombres sécurisés
const numberField = (label: string) =>
	z.coerce.number().refine((val) => !isNaN(val), {
		message: `${label} doit être un nombre`
	});

// 🧠 BASE
const baseSchema = z.object({
	catId: z.uuid().optional()
});

// 👤 STEP 1 - profil adoptant
export const step1Schema = z.object({
	firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
	lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
	address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
	phone: z.string().min(10, 'Numéro de téléphone invalide'),
	email: z.email("L'adresse email n'est pas valide"),
	age: numberField("L'âge").min(18, 'Vous devez avoir au moins 18 ans').max(100, 'Âge invalide')
});

// 🏠 STEP 2 - foyer
export const step2Schema = z.object({
	housingSize: numberField('La taille du logement')
		.min(10, 'Minimum 10 m²')
		.max(1000, 'Valeur trop élevée'),

	hasGarden: z.boolean(),

	gardenSize: numberField('La taille du jardin').min(0).max(1000).optional(),

	hasPets: z.boolean(),

	numberOfCats: numberField('Nombre de chats').min(0).default(0),
	numberOfDogs: numberField('Nombre de chiens').min(0).default(0),

	otherPets: z.string().optional(),

	numberOfChildren: numberField("Nombre d'enfants").min(0)
});

// 🔗 FINAL (comme ton ancien form → clean extend)
export const QuickAdoptionFormSchema = baseSchema
	.extend(step1Schema.shape)
	.extend(step2Schema.shape)
	.superRefine((data, ctx) => {
		if (data.hasGarden && !data.gardenSize) {
			ctx.addIssue({
				path: ['gardenSize'],
				code: 'custom',
				message: 'Taille du jardin requise'
			});
		}
	});

export type QuickAdoptionForm = z.infer<typeof QuickAdoptionFormSchema>;
