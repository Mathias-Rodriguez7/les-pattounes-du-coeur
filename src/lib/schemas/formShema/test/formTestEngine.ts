import { describe, it, expect } from 'vitest';
import type { FormOverride } from './types';

type TestCase<T> = {
	name: string;
	override: FormOverride<T>;
	expected: boolean;
};

type SafeParseResult =
	| { success: true }
	| { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };

type FormTestConfig<T> = {
	schema: {
		safeParse: (data: unknown) => SafeParseResult;
	};
	makeValid: (override?: FormOverride<T>) => T;
	cases: Record<string, TestCase<T>[]>;
};

// Formate les erreurs : "  - email: L'adresse email n'est pas valide"
function formatIssues(result: SafeParseResult): string {
	if (result.success) return '';
	return result.error.issues
		.map((i) => `  - ${i.path.join('.') || '(racine)'}: ${i.message}`)
		.join('\n');
}

export function createFormTests<T>(config: FormTestConfig<T>) {
	describe('FORM TESTS', () => {
		it('should validate a complete correct form', () => {
			const data = config.makeValid();
			const result = config.schema.safeParse(data);

			expect(
				result.success,
				`Le formulaire valide a été rejeté :\n${formatIssues(result)}\n\nDonnées : ${JSON.stringify(data, null, 2)}`
			).toBe(true);
		});

		Object.entries(config.cases).forEach(([step, cases]) => {
			describe(step, () => {
				cases.forEach((c) => {
					it(c.name, () => {
						const data = config.makeValid(c.override);
						const result = config.schema.safeParse(data);

						const message = c.expected
							? `Attendu valide mais rejeté :\n${formatIssues(result)}`
							: `Attendu invalide mais accepté (override : ${JSON.stringify(c.override)})`;

						expect(result.success, message).toBe(c.expected);
					});
				});
			});
		});
	});
}
