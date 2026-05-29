export const quickAdoptionFormCases = {
	step1: [
		{
			name: 'invalid email',
			override: {
				email: 'bad-email'
			},
			expected: false
		},
		{
			name: 'underage adopter',
			override: {
				age: 15
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
