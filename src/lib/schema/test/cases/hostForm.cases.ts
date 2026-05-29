export const hostFormCases = {
	step1: [
		{
			name: 'invalid email',
			override: { email: 'bad-email' },
			expected: false
		},
		{
			name: 'underage host',
			override: { age: 16 },
			expected: false
		},
		{
			name: 'missing job',
			override: { job: '' },
			expected: false
		}
	],

	step2: [
		{
			name: 'outside without description',
			override: {
				outside: true,
				outsideDescription: ''
			},
			expected: false
		},
		{
			name: 'negative cats number',
			override: {
				hasAnimalsAtHome: true,
				numberOfCatsAtHome: -1
			},
			expected: false
		}
	],

	step3: [
		{
			name: 'invalid host type',
			override: { type: 'INVALID' as any },
			expected: false
		}
	],

	step4: [
		{
			name: 'motivation too short',
			override: { motivation: 'short' },
			expected: false
		}
	]
};
