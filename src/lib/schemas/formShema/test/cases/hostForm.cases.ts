import type { FormOverride } from './types';
import type { HostInput } from './makeValidHostForm';

type Case = { name: string; override: FormOverride<HostInput>; expected: boolean };

const seventeenYearsAgo = new Date();
seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);

export const hostFormCases: Record<string, Case[]> = {
	step1: [
		{ name: 'invalid email', override: { email: 'bad-email' }, expected: false },
		{ name: 'invalid postal code', override: { postalCode: '123' }, expected: false },
		{ name: 'missing city', override: { city: '' }, expected: false },
		{ name: 'invalid district', override: { district: 'NOPE' }, expected: false }
	],

	step2: [
		{ name: 'space too small', override: { space: 5 }, expected: false },
		{ name: 'space not a number', override: { space: 'abc' }, expected: false },
		{
			name: 'outside without description',
			override: { outside: true, outsideDescription: '' },
			expected: false
		},
		{
			name: 'no outside, no description',
			override: { outside: false, outsideDescription: '' },
			expected: true
		},
		{
			name: 'negative cats number',
			override: { hasAnimalsAtHome: true, numberOfCatsAtHome: -1 },
			expected: false
		},
		{ name: 'homeDescription too short', override: { homeDescription: 'court' }, expected: false }
	],

	step3: [
		{ name: 'invalid host type', override: { type: 'INVALID' }, expected: false },
		{ name: 'null host type accepted', override: { type: null }, expected: true },
		{ name: 'invalid heal', override: { heal: 'INVALID' }, expected: false }
	],

	step4: [
		{ name: 'motivation too short', override: { motivation: 'short' }, expected: false },
		{ name: 'negative catAdult', override: { catAdult: -1 }, expected: false }
	]
};
