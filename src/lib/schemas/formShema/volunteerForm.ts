import { z } from 'zod';
import { District } from '@prisma/client';

const districtEnum = z
	.enum(Object.values(District) as [string, ...string[]])
	.transform((val) => val as District);

// ✅ Convertir les strings en dates
const stringToDate = z.string().pipe(z.coerce.date()).nullable().optional();

const optionalText = z
	.string()
	.nullish()
	.transform((val) => (val?.trim() ? val.trim() : undefined));

//
// STEP 1
//
export const volunteerStep1Schema = z.object({
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
// STEP 2
//
export const volunteerStep2Schema = z.object({
	hasCatExperience: z.boolean(),
	catExperienceDescription: optionalText,

	hasAssociationExperience: z.boolean(),
	associationExperienceDescription: optionalText,

	hasMedicalCareExperience: z.boolean(),
	medicalCareDescription: optionalText,

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
	skills: optionalText,
	additionalInformation: optionalText
});

//
// REFINEMENTS LOGIC
//

const volunteerFormRefinements = (data: any, ctx: any) => {
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
};

//
// GLOBAL SCHEMA (sans superRefine !)
//

export const volunteerFormSchemaBase = z.object({
	...volunteerStep1Schema.shape,
	...volunteerStep2Schema.shape,
	...volunteerStep3Schema.shape,
	...volunteerStep4Schema.shape
});

export const volunteerFormSchema = volunteerFormSchemaBase.superRefine(volunteerFormRefinements);

//
// TYPES
//

export type VolunteerIdentitySchema = z.infer<typeof volunteerStep1Schema>;

export type VolunteerExperienceSchema = z.infer<typeof volunteerStep2Schema>;

export type VolunteerAvailabilitySchema = z.infer<typeof volunteerStep3Schema>;

export type VolunteerMotivationSchema = z.infer<typeof volunteerStep4Schema>;

export type FormVolunteerSchema = z.infer<typeof volunteerFormSchema>;

//
// UPDATE SCHEMA (partial + refinements)
//

export const updateVolunteerSchema = volunteerFormSchemaBase
	.partial()
	.superRefine(volunteerFormRefinements)
	.extend({
		formId: z.string().uuid('ID invalide'),
		status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
		notes: z.string().optional().nullable(),
		assignedToId: z.string().uuid('ID invalide').optional().nullable()
	});

export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;
