import type { FormHostSchema } from '../../hostForm';

export function makeValidHostForm(override: Partial<FormHostSchema> = {}): FormHostSchema {
	return {
		// STEP 1 — identité
		firstName: 'Jean',
		lastName: 'Dupont',
		phone: '0612345678',
		email: 'jean@example.com',
		address: '10 rue de Paris',
		age: 30,
		job: 'Développeur',

		// STEP 2 — logement
		space: 'MEDIUM',
		outside: true,
		outsideDescription: 'J’ai un accès à un jardin sécurisé',
		hasAnimalsAtHome: true,
		numberOfCatsAtHome: 1,
		numberOfDogsAtHome: 0,
		otherAnimalsAtHome: '',
		homeDescription: 'Appartement lumineux en centre-ville',

		// STEP 3 — expérience
		type: 'CLASSIC',
		heal: 'LIGHT',
		socialize: 'EXPERIENCED',
		car: true,
		babyFeeding: 'EXPERIENCED',

		// STEP 4 — disponibilité
		canHostAdultCats: true,
		canHostKittens: false,
		canHostMotherAndKittens: false,
		presenceWeek: 'HOME_HALF_DAY',
		availabilityDuration: '3_TO_6_MONTHS',
		motivation: 'J’aime beaucoup aider les animaux et participer à leur bien-être',
		additionalMessage: '',

		...override
	};
}
