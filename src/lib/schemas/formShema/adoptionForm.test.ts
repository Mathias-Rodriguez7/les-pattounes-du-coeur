import { createFormTests } from './test/formTestEngine';
import { describe, expect, it } from 'vitest';
import { adoptionFormSchema, updateAdoptionFormSchema } from './adoptionForm';
import { makeValidAdoptionForm } from './test/factories/adoptionForm.factory';
import { adoptionFormCases } from './test/cases/adoptionForm.cases';

createFormTests({
	schema: adoptionFormSchema,
	makeValid: makeValidAdoptionForm,
	cases: adoptionFormCases
});

// Mise à jour : convertFormData envoie null pour un champ laissé vide
describe('updateAdoptionFormSchema – champs texte vidés', () => {
	const formId = '7f9c2b1e-3d4a-4b5c-8e6f-1a2b3c4d5e6f';

	it('accepte null (champ vide) et le garde pour effacer l’ancienne valeur', () => {
		const result = updateAdoptionFormSchema.safeParse({
			formId,
			otherPets: null,
			color: null,
			temperament: ''
		});
		expect(result.success).toBe(true);
		expect(result.data).toMatchObject({ otherPets: null, color: null, temperament: null });
	});

	it('vérifie toujours la longueur d’un texte rempli', () => {
		const result = updateAdoptionFormSchema.safeParse({ formId, temperament: 'abc' });
		expect(result.success).toBe(false);
	});
});
