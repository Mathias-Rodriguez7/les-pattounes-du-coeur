export const volunteerFormCases = {
	step1: [
		{
			name: 'invalid email',
			override: {
				email: 'bad-email'
			},
			expected: false
		},
		{
			name: 'underage volunteer',
			override: {
				age: 16
			},
			expected: false
		},
		{
			name: 'invalid phone',
			override: {
				phone: '123'
			},
			expected: false
		}
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
