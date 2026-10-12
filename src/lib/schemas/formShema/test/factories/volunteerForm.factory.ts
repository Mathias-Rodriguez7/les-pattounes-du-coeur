import type { z } from 'zod';
import { volunteerFormSchema } from '../../volunteerForm';
import type { FormOverride } from '../types';

type VolunteerFormData = z.infer<typeof volunteerFormSchema>;

export function makeValidVolunteerForm(
	override: FormOverride<VolunteerFormData> = {}
): VolunteerFormData {
	return {
		firstName: 'Jean',
		lastName: 'Dupont',
		phone: '0612345678',
		email: 'jean@example.com',
		address: '10 rue de Paris',
		birthDate: '1990-01-01',
		city: 'Montpellier',
		postalCode: '34000',
		district: 'PRES_D_ARENES',

		hasCatExperience: true,
		catExperienceDescription: 'Expérience avec chats',

		hasAssociationExperience: false,
		associationExperienceDescription: 'aucune',

		hasMedicalCareExperience: true,
		medicalCareDescription: 'Soins de base',

		hasTransportExperience: true,

		car: true,
		availability: 'MEDIUM',

		// 🔥 FIX ICI
		availabilityDuration: '3_TO_6_MONTHS',

		canHelpWeekdays: true,
		canHelpWeekends: false,
		canHelpEmergencies: true,

		motivation: 'Je veux aider les animaux',
		skills: 'Organisation',
		additionalInformation: 'aucune',

		...override
	} as VolunteerFormData;
}
