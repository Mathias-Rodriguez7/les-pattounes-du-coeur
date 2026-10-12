import type { z } from 'zod';
import type { adoptionFormSchema } from '../../adoptionForm';
import type { FormOverride } from './types';

type AdoptionInput = z.input<typeof adoptionFormSchema>;

type Case = {
	name: string;
	override: FormOverride<AdoptionInput>;
	expected: boolean;
};

const seventeenYearsAgo = new Date();
seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);

export const adoptionFormCases: Record<string, Case[]> = {
	step1: [
		{ name: 'invalid email', override: { email: 'bad-email' }, expected: false },
		{ name: 'underage user', override: { birthDate: seventeenYearsAgo }, expected: false },
		{ name: 'empty birthDate', override: { birthDate: '' }, expected: false },
		{ name: 'birthDate as string', override: { birthDate: '1990-01-01' }, expected: true },
		{ name: 'invalid postal code', override: { postalCode: '123' }, expected: false },
		{ name: 'invalid district', override: { district: 'NOPE' }, expected: false },
		{ name: 'empty city', override: { city: '' }, expected: false }
	],

	step2: [
		{ name: 'invalid catAge', override: { catAge: 'baby' }, expected: false },
		{ name: 'invalid catSex', override: { catSex: 'other' }, expected: false },
		{ name: 'empty color is accepted', override: { color: '' }, expected: true },
		{ name: 'temperament too short', override: { temperament: 'ok' }, expected: false }
	],

	step3: [
		{
			name: 'missing garden size when hasGarden is true',
			override: { hasGarden: true, gardenSize: undefined },
			expected: false
		},
		{
			name: 'no garden, no size',
			override: { hasGarden: false, gardenSize: undefined },
			expected: true
		},
		{ name: 'negative cats', override: { numberOfCats: -1 }, expected: false },
		{ name: 'housing too small', override: { housingSize: 5 }, expected: false }
	]
};
