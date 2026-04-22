import { z } from 'zod';

// 👤 STEP 1
export const step1Schema = z.object({
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	address: z.string().min(5),
	email: z.string().email(),
	age: z.coerce.number().min(18).max(100)
});

// 🐱 STEP 2
export const step2Schema = z.object({
	catAge: z.enum(['kitten', 'adult', 'senior']),
	catSex: z.enum(['male', 'female']),
	color: z.string(),
	furLength: z.enum(['short', 'medium', 'long']),
	temperament: z.string().min(5)
});

// 🏠 STEP 3
export const step3Schema = z.object({
	housingSize: z.coerce.number().min(10).max(1000), // m²
	hasGarden: z.boolean(),
	gardenSize: z.string().min(1).optional(),
	numberOfPets: z.coerce.number().min(0),
	numberOfChildren: z.coerce.number().min(0)
});

// 🔗 GLOBAL SCHEMA
export const adoptionFormSchema = step1Schema
	.merge(step2Schema)
	.merge(step3Schema)
	.superRefine((data, ctx) => {
		if (data.hasGarden && !data.gardenSize) {
			ctx.addIssue({
				path: ['gardenSize'],
				code: z.ZodIssueCode.custom,
				message: 'Garden size is required'
			});
		}
	});

// 🧠 TYPE TS
export type AdoptionForm = z.infer<typeof adoptionFormSchema>;
