export const volunteerFormCases = {
	step1: [
		{ name: 'invalid email', override: { email: 'bad-email' }, expected: false },
		{ name: 'invalid postal code', override: { postalCode: '123' }, expected: false },
		{ name: 'missing city', override: { city: '' }, expected: false },
		{ name: 'invalid district', override: { district: 'NOPE' }, expected: false }
	],

	step2: [
		{
			name: 'missing cat experience description',
			override: {
				hasCatExperience: true,
				catExperienceDescription: ''
			},
			expected: false
		}
	],

	step3: [
		{
			name: 'invalid availability enum',
			override: {
				availability: 'VERY_HIGH'
			},
			expected: false
		}
	],

	step4: [
		{
			name: 'motivation too short',
			override: {
				motivation: 'short'
			},
			expected: false
		}
	]
};
