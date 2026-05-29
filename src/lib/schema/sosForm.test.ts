import { createFormTests } from './test/formTestEngine';

import { sosFormSchema } from './sosForm';

import { makeValidSosForm } from './test/factories/sosForm.factory';
import { sosFormCases } from './test/cases/sosForm.cases';

createFormTests({
	schema: sosFormSchema,
	makeValid: makeValidSosForm,
	cases: sosFormCases
});
