export const colabFormCases = {
	step1: [
		{
			name: 'invalid email',
			override: { email: 'bad-email' },
			expected: false
		},
		{
			name: 'email with spaces and uppercase',
			override: { email: '  Jean@Example.COM  ' },
			expected: true
		},
		{
			name: 'missing first name',
			override: { firstName: '' },
			expected: false
		},
		{
			name: 'invalid phone',
			override: { phone: '123' },
			expected: false
		}
	],

	step2: [
		{
			name: 'presentation too short',
			override: { presentation: 'short text' },
			expected: false
		},
		{
			name: 'proposal too short',
			override: { partnershipProposal: 'too short' },
			expected: false
		}
	]
};
