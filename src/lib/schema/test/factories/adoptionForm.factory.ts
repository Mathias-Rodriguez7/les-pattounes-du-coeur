import type { AdoptionForm } from '../adoptionForm';

export function makeValidAdoptionForm(override: Partial<AdoptionForm> = {}): AdoptionForm {
	return {
		// STEP 1
		firstName: 'Jean',
		lastName: 'Dupont',
		address: '10 rue de Paris',
		phone: '0612345678',
		email: 'jean@example.com',
		age: 25,

		// STEP 2
		catAge: 'adult',
		catSex: 'male',
		color: 'black',
		furLength: 'short',
		temperament: 'calme et affectueux',

		// STEP 3
		housingSize: 80,
		hasGarden: true,
		gardenSize: 50,
		hasPets: false,
		numberOfCats: 0,
		numberOfDogs: 0,
		numberOfChildren: 0,

		// override intelligent
		...override
	};
}
