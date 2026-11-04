const seventeenYearsAgo = new Date();
seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);

export const quickAdoptionFormCases = {
	step1: [
		{ name: 'invalid email', override: { email: 'bad-email' }, expected: false },
		{
			name: 'email with spaces and uppercase',
			override: { email: '  Jean@Example.COM  ' },
			expected: true
		},
		{ name: 'underage user', override: { birthDate: seventeenYearsAgo }, expected: false },
		{ name: 'empty birthDate', override: { birthDate: '' }, expected: false },
		{ name: 'birthDate as string', override: { birthDate: '1990-01-01' }, expected: true },
		{ name: 'invalid postal code', override: { postalCode: '123' }, expected: false },
		{ name: 'invalid district', override: { district: 'NOPE' }, expected: false },
		{ name: 'empty city', override: { city: '' }, expected: false }
	],

	step2: [
		{
			name: 'missing garden size',
			override: {
				hasGarden: true,
				gardenSize: undefined
			},
			expected: false
		},
		{
			name: 'negative cats count',
			override: {
				numberOfCats: -1
			},
			expected: false
		},
		{
			name: 'housing too small',
			override: {
				housingSize: 5
			},
			expected: false
		}
	],

	base: [
		{
			name: 'invalid catId',
			override: {
				catId: 'invalid-uuid'
			},
			expected: false
		}
	]
};
