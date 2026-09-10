import { z } from 'zod';

//
// STEP 1
//
export const volunteerStep1Schema = z.object({
	firstName: z.string().min(1, 'Le prénom est obligatoire'),
	lastName: z.string().min(1, 'Le nom est obligatoire'),
	phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
	email: z.email('Email invalide'),
	address: z.string().min(1, "L'adresse est obligatoire"),
	age: z.coerce.number().min(18, 'Vous devez être majeur'),
	job: z.string().min(1, 'Le métier est obligatoire')
});

//
// STEP 2
//
export const volunteerStep2Schema = z.object({
	hasCatExperience: z.boolean(),
	catExperienceDescription: z.string().optional(),

	hasAssociationExperience: z.boolean(),
	associationExperienceDescription: z.string().optional(),

	hasMedicalCareExperience: z.boolean(),
	medicalCareDescription: z.string().optional(),

	hasTransportExperience: z.boolean()
});

//
// STEP 3
//
export const volunteerStep3Schema = z.object({
	car: z.boolean(),
	availability: z.enum(['LOW', 'MEDIUM', 'HIGH']),
	availabilityDuration: z.enum([
		'LESS_THAN_1_MONTH',
		'1_TO_3_MONTHS',
		'3_TO_6_MONTHS',
		'MORE_THAN_6_MONTHS',
		'LONG_TERM'
	]),

	canHelpWeekdays: z.boolean(),
	canHelpWeekends: z.boolean(),
	canHelpEmergencies: z.boolean()
});

//
// STEP 4
//
export const volunteerStep4Schema = z.object({
	motivation: z.string().min(10),
	skills: z.string().optional(),
	additionalInformation: z.string().optional()
});

//
// GLOBAL SCHEMA (UNIFORME)
//
export const volunteerFormSchema = z
	.object({
		...volunteerStep1Schema.shape,
		...volunteerStep2Schema.shape,
		...volunteerStep3Schema.shape,
		...volunteerStep4Schema.shape
	})
	.superRefine((data, ctx) => {
		// Cat experience
		if (data.hasCatExperience && !data.catExperienceDescription?.trim()) {
			ctx.addIssue({
				path: ['catExperienceDescription'],
				code: 'custom',
				message: 'Description obligatoire'
			});
		}

		// Association experience
		if (data.hasAssociationExperience && !data.associationExperienceDescription?.trim()) {
			ctx.addIssue({
				path: ['associationExperienceDescription'],
				code: 'custom',
				message: 'Description obligatoire'
			});
		}

		// Medical care
		if (data.hasMedicalCareExperience && !data.medicalCareDescription?.trim()) {
			ctx.addIssue({
				path: ['medicalCareDescription'],
				code: 'custom',
				message: 'Description obligatoire'
			});
		}
	});
