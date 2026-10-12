import type { QuickAdoptionForm } from '../../quickAdoptionForm';

export function makeValidQuickAdoptionForm(
	override: Partial<QuickAdoptionForm> = {}
): QuickAdoptionForm {
	return {
		catId: crypto.randomUUID(),

		// STEP 1
		firstName: 'Jean',
		lastName: 'Dupont',
		address: '10 rue de Paris',
		phone: '0612345678',
		email: 'jean@example.com',
		age: 25,

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
	};
}
