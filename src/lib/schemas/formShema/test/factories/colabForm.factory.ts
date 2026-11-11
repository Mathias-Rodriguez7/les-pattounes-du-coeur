import type { ColabFormData } from '../../colabForm';
import type { FormOverride } from '../types';

export function makeValidColabForm(override: FormOverride<ColabFormData> = {}): ColabFormData {
	return {
		// STEP 1
		firstName: 'Jean',
		lastName: 'Dupont',
		companyName: 'Tech Corp',
		email: 'jean@example.com',
		phone: '0612345678',

		// STEP 2
		presentation: 'Nous sommes une entreprise spécialisée dans le développement web moderne.',
		partnershipProposal:
			'Nous souhaitons proposer une collaboration autour de projets digitaux innovants.',

		...override
	} as ColabFormData;
}
