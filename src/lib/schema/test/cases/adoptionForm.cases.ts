export const adoptionFormCases = {
	step1: [
		{
			name: 'invalid email',
			override: { email: 'bad-email' },
			expected: false
		},
		{
			name: 'underage user',
			override: { age: 16 },
			expected: false
		}
	],

	step2: [
		{
			name: 'invalid catAge',
			override: { catAge: 'baby' as any },
			expected: false
		}
	],

	step3: [
		{
			name: 'missing garden size when hasGarden is true',
			override: { hasGarden: true, gardenSize: undefined },
			expected: false
		}
	]
};
