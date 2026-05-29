import type { z } from 'zod';

import { sosFormSchema } from '../../sosForm';

import type { FormOverride } from '../types';

type SosFormData = z.infer<typeof sosFormSchema>;

export function makeValidSosForm(override: FormOverride<SosFormData> = {}): SosFormData {
	return {
		alertType: 'abandon',

		lastName: 'Dupont',
		firstName: 'Jean',

		phone: '0612345678',
		email: 'jean@example.com',

		description: 'Un chat semble abandonné depuis plusieurs jours.',

		address: '10 rue de Paris',

		...override
	} as SosFormData;
}
