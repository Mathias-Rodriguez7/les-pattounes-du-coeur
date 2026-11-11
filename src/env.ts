import { defineEnvVars } from '@sveltejs/kit/env';

// @migration-task Review usage of dynamic environment variables. They fall back to the empty string if not present, which may not be what you want.
export const variables = defineEnvVars({
	SMTP_HOST: { schema: (input) => input ?? '' },
	SMTP_PORT: { schema: (input) => input ?? '' },
	SMTP_USER: { schema: (input) => input ?? '' },
	SMTP_PASS: { schema: (input) => input ?? '' },
	SMTP_FROM: { schema: (input) => input ?? '' },
	ASSOCIATION_EMAIL: { schema: (input) => input ?? '' },
	PUBLIC_MEDIA_BASE_URL: { public: true, schema: (input) => input ?? '' }
});
