import { describe, expect, it } from 'vitest';
import { newPasswordSchema, PASSWORD_RULES } from './password';

describe('PASSWORD_RULES', () => {
	it('un bon mot de passe passe toutes les règles', () => {
		expect(PASSWORD_RULES.every((rule) => rule.test('Pattounes1!'))).toBe(true);
	});

	it('chaque règle a son cas d’échec', () => {
		expect(PASSWORD_RULES.map((rule) => rule.test('court'))).toEqual([false, false, false, false]);
	});
});

describe('newPasswordSchema', () => {
	it('accepte un mot de passe valide et confirmé', () => {
		const result = newPasswordSchema.safeParse({
			newPassword: 'Pattounes1!',
			confirmPassword: 'Pattounes1!'
		});
		expect(result.success).toBe(true);
	});

	it('refuse une confirmation différente, sur le bon champ', () => {
		const result = newPasswordSchema.safeParse({
			newPassword: 'Pattounes1!',
			confirmPassword: 'Pattounes2!'
		});
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].path).toEqual(['confirmPassword']);
	});

	it('refuse un mot de passe sans caractère spécial', () => {
		const result = newPasswordSchema.safeParse({
			newPassword: 'Pattounes1',
			confirmPassword: 'Pattounes1'
		});
		expect(result.success).toBe(false);
	});
});
