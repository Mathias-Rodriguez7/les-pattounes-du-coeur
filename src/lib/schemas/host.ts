import { z } from 'zod';

export const hostTypeEnum = z.enum(['CLASSIC', 'RELAY']);

export const healEnum = z.enum(['NO', 'LIGHT', 'HEAVY', 'HEAVY_STING']);

export const socializeEnum = z.enum(['NO', 'FEARFUL', 'WITHOUT_EX', 'EXPERIENCED']);

export const babyFeedingEnum = z.enum(['NO', 'WITHOUT_EX', 'EXPERIENCED', 'RELAY']);

export const createHostSchema = z
	.object({
		// Profil
		firstName: z.string().min(1, 'Le prénom est obligatoire').max(60),
		lastName: z.string().min(1, 'Le nom est obligatoire').max(60),
		email: z.string().email('Email invalide'),
		phone: z
			.string()
			.regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro invalide')
			.transform((val) => val.replace(/\s+/g, '')), // Enlève les espaces
		address: z.string().min(1, "L'adresse est obligatoire").max(100),
		city: z.string().min(1, 'La ville est obligatoire').max(80),
		postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
		district: z.string().optional(),

		// Host basiques
		age: z.coerce.number().min(18, 'Vous devez être majeur').max(120),
		type: hostTypeEnum,
		space: z.coerce.number().min(0),
		homeDescription: z.string().min(10, 'Description minimale 10 caractères').max(500), // ✅ Ajoute max
		presence: z.string().min(1, 'Présence obligatoire').max(255),

		// Animaux
		hasAnimalsAtHome: z.boolean().default(false),
		numberOfCatsAtHome: z.coerce.number().min(0).default(0), // ✅ Simplifie
		numberOfDogsAtHome: z.coerce.number().min(0).default(0), // ✅ Simplifie
		otherAnimalsAtHome: z.string().max(255).optional(),

		// Extérieur
		outside: z.boolean().default(false),
		outsideDescription: z.string().max(500).optional(),
		isStockFeed: z.boolean().default(false),

		// Soins & Socialize
		heal: healEnum,
		socialize: socializeEnum,
		car: z.boolean().default(false),
		babyFeeding: babyFeedingEnum,

		// Disponibilité & Infos
		additionalInformation: z.string().max(1000).optional() // ✅ Enlève .default('')
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
		if (data.hasAnimalsAtHome) {
			const cats = data.numberOfCatsAtHome ?? 0;
			const dogs = data.numberOfDogsAtHome ?? 0;

			if (cats < 0) {
				ctx.addIssue({
					code: 'custom',
					path: ['numberOfCatsAtHome'],
					message: 'Le nombre de chats doit être positif'
				});
			}

			if (dogs < 0) {
				ctx.addIssue({
					code: 'custom',
					path: ['numberOfDogsAtHome'],
					message: 'Le nombre de chiens doit être positif'
				});
			}
		}
	});

export type CreateHostSchema = z.infer<typeof createHostSchema>;
