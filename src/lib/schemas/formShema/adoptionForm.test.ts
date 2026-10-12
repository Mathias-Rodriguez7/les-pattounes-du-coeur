import { createFormTests } from './test/formTestEngine';
import { adoptionFormSchema } from './adoptionForm';
import { makeValidAdoptionForm } from './test/factories/adoptionForm.factory';
import { adoptionFormCases } from './test/cases/adoptionForm.cases';

createFormTests({
	schema: adoptionFormSchema,
	makeValid: makeValidAdoptionForm,
	cases: adoptionFormCases
});
