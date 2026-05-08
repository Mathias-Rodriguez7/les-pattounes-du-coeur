import { volunteerFormSchema } from './volunteerForm';

export const step1Schema = volunteerFormSchema.pick({
	firstName: true,
	lastName: true,
	phone: true,
	email: true,
	address: true,
	age: true,
	job: true
});

export const step2Schema = volunteerFormSchema.pick({
	hasCatExperience: true,
	catExperienceDescription: true,
	hasAssociationExperience: true,
	associationExperienceDescription: true,
	hasMedicalCareExperience: true,
	medicalCareDescription: true,
	hasTransportExperience: true
});

export const step3Schema = volunteerFormSchema.pick({
	car: true,
	availability: true,
	availabilityDuration: true,
	canHelpWeekdays: true,
	canHelpWeekends: true,
	canHelpEmergencies: true
});

export const step4Schema = volunteerFormSchema.pick({
	motivation: true,
	skills: true,
	additionalInformation: true
});
