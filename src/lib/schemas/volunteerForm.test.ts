import { createFormTests } from './test/formTestEngine';

import { volunteerFormSchema } from './volunteerForm';

import { makeValidVolunteerForm } from './test/factories/volunteerForm.factory';
import { volunteerFormCases } from './test/cases/volunteerForm.cases';

createFormTests({
	schema: volunteerFormSchema,
	makeValid: makeValidVolunteerForm,
	cases: volunteerFormCases
});
