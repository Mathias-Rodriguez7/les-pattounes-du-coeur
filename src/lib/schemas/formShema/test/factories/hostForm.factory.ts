import type { z } from 'zod';
import type { hostFormSchema } from '../../hostForm';

export type HostInput = z.input<typeof hostFormSchema>;

export function makeValidHostForm(override: Partial<HostInput> = {}): HostInput {
	return {
		// STEP 1
		firstName: 'Jean',
		lastName: 'Dupont',
		phone: '0612345678',
		email: 'jean@example.com',
		address: '10 rue de Paris',
		birthDate: '1990-01-01',
		city: 'Montpellier',
		postalCode: '34000',
		district: 'PRES_D_ARENES',

		// STEP 2
		space: 40,
		outside: true,
		outsideDescription: "J'ai un accès à un jardin sécurisé",
		hasAnimalsAtHome: true,
		numberOfCatsAtHome: 1,
		numberOfDogsAtHome: 0,
		otherAnimalsAtHome: '',
		homeDescription: 'Appartement lumineux en centre-ville',

		// STEP 3
		type: 'CLASSIC',
		heal: 'LIGHT',
		socialize: 'EXPERIENCED',
		car: true,
		babyFeeding: 'EXPERIENCED',

		// STEP 4
		catAdult: 2,
		kittyAndKitten: false,
		kitten: 0,
		presence: 'HOME_HALF_DAY',
		motivation: "J'aime beaucoup aider les animaux et participer à leur bien-être",
		additionalMessage: '',

		...override
	};
}
