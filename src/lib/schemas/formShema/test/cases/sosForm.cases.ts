export const sosFormCases = {
	alert: [
		{
			name: 'invalid alert type',
			override: {
				alertType: 'invalid'
			},
			expected: false
		}
	],

	identity: [
		{
			name: 'missing first name',
			override: {
				firstName: ''
			},
			expected: false
		},
		{
			name: 'missing last name',
			override: {
				lastName: ''
			},
			expected: false
		}
	],

	contact: [
		{
			name: 'invalid email',
			override: {
				email: 'bad-email'
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

	description: [
		{
			name: 'description too short',
			override: {
				description: 'short'
			},
			expected: false
		}
	],

	address: [
		{
			name: 'address too short',
			override: {
				address: 'abc'
			},
			expected: false
		}
	]
};
