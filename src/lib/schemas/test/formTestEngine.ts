import { describe, it, expect } from 'vitest';
import type { FormOverride } from './types';

type TestCase<T> = {
	name: string;
	override: FormOverride<T>;
	expected: boolean;
};

type FormTestConfig<T> = {
	schema: {
		safeParse: (data: unknown) => { success: boolean };
	};

	makeValid: (override?: FormOverride<T>) => T;

	cases: Record<string, TestCase<T>[]>;
};

export function createFormTests<T>(config: FormTestConfig<T>) {
	describe('FORM TESTS', () => {
		it('should validate a complete correct form', () => {
			const result = config.schema.safeParse(config.makeValid());

			expect(result.success).toBe(true);
		});

		Object.entries(config.cases).forEach(([step, cases]) => {
			describe(step, () => {
				cases.forEach((c) => {
					it(c.name, () => {
						const result = config.schema.safeParse(config.makeValid(c.override));

						expect(result.success).toBe(c.expected);
					});
				});
			});
		});
	});
}
