import type { z } from 'zod';
import { adoptionFormSchema } from '../../adoptionForm';

type AdoptionInput = z.input<typeof adoptionFormSchema>;

export function makeValidAdoptionForm(override: Partial<AdoptionInput> = {}): AdoptionInput {
	return {
		firstName: 'Jean',
		lastName: 'Dupont',
		phone: '0612345678',
		email: 'jean@example.com',
		address: '10 rue de Paris',
		birthDate: new Date('1990-01-01'),
		city: 'Montpellier',
		postalCode: '34000',
		district: 'PRES_D_ARENES',

		catAge: 'adult',
		catSex: 'male',
		color: 'black',
		furLength: 'short',
		temperament: 'calme et affectueux',

		housingSize: 80,
		hasGarden: true,
		gardenSize: 50,
		hasPets: false,
		numberOfCats: 0,
		numberOfDogs: 0,
		numberOfChildren: 0,

		...override
	};
}
