import { createFormTests } from './test/formTestEngine';
import { colabForm } from './colabForm';
import { makeValidColabForm } from './test/factories/colabForm.factory';
import { colabFormCases } from './test/cases/colabForm.cases';

createFormTests({
	schema: colabForm,
	makeValid: makeValidColabForm,
	cases: colabFormCases
});
