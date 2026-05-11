import { z } from 'zod';

export const volunteerFormSchema = z.object({
	// STEP 1
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	phone: z.string(),
	email: z.email(),
	address: z.string().min(1),
	age: z.coerce.number().min(18),
	job: z.string().min(1),

	// STEP 2
	hasCatExperience: z.boolean(),
	catExperienceDescription: z.string().optional(),

	hasAssociationExperience: z.boolean(),
	associationExperienceDescription: z.string().optional(),

	hasMedicalCareExperience: z.boolean(),
	medicalCareDescription: z.string().optional(),

	hasTransportExperience: z.boolean(),

	// STEP 3
	car: z.boolean(),
	availability: z.enum(['LOW', 'MEDIUM', 'HIGH']),
	availabilityDuration: z.string(),

	canHelpWeekdays: z.boolean(),
	canHelpWeekends: z.boolean(),
	canHelpEmergencies: z.boolean(),

	// STEP 4
	motivation: z.string().min(10),
	skills: z.string().optional(),
	additionalInformation: z.string().optional()
});
