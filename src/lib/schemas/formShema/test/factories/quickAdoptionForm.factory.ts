import type { QuickAdoptionForm } from '../../quickAdoptionForm';
import type { FormOverride } from '../types';

export function makeValidQuickAdoptionForm(
	override: FormOverride<QuickAdoptionForm> = {}
): QuickAdoptionForm {
	return {
		// STEP 1
		firstName: 'Jean',
		lastName: 'Dupont',
		phone: '0612345678',
		email: 'jean@example.com',
		address: '10 rue de Paris',
		birthDate: new Date('1990-01-01'),
		city: 'Montpellier',
		postalCode: '34000',
		district: 'PRES_D_ARENES',

		// STEP 2
		housingSize: 80,
		hasGarden: true,
		gardenSize: 50,
		hasPets: false,
		numberOfCats: 0,
		numberOfDogs: 0,
		otherPets: '',
		numberOfChildren: 0,

		...override
	} as QuickAdoptionForm;
}
