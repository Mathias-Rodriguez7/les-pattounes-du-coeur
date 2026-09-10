import { createFormTests } from './test/formTestEngine';
import { QuickAdoptionFormSchema } from './quickAdoptionForm';
import { makeValidQuickAdoptionForm } from './test/factories/quickAdoptionForm.factory';
import { quickAdoptionFormCases } from './test/cases/quickAdoptionForm.cases';

createFormTests({
	schema: QuickAdoptionFormSchema,
	makeValid: makeValidQuickAdoptionForm,
	cases: quickAdoptionFormCases
});
