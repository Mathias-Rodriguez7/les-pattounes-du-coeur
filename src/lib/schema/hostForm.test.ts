import { createFormTests } from './test/formTestEngine';
import { hostFormSchema } from './hostForm';
import { makeValidHostForm } from './test/factories/hostForm.factory';
import { hostFormCases } from './test/cases/hostForm.cases';

createFormTests({
	schema: hostFormSchema,
	makeValid: makeValidHostForm,
	cases: hostFormCases
});
