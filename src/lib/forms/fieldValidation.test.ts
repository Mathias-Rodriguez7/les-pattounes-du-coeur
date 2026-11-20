import { describe, expect, it } from 'vitest';
import { EMAIL_MESSAGE, REQUIRED_MESSAGE, localFieldError } from './fieldValidation.ts';

describe('localFieldError', () => {
	it('champ obligatoire vide (ou que des espaces)', () => {
		expect(localFieldError({ value: '', required: true })).toBe(REQUIRED_MESSAGE);
		expect(localFieldError({ value: '   ', required: true })).toBe(REQUIRED_MESSAGE);
		expect(localFieldError({ value: undefined, required: true })).toBe(REQUIRED_MESSAGE);
	});

	it('champ facultatif vide : pas d’erreur', () => {
		expect(localFieldError({ value: '', type: 'email' })).toBe('');
	});

	it('email', () => {
		expect(localFieldError({ value: 'marie@exemple', type: 'email' })).toBe(EMAIL_MESSAGE);
		expect(localFieldError({ value: 'marie@exemple.fr', type: 'email' })).toBe('');
	});

	it('nombre 0 rempli : pas d’erreur', () => {
		expect(localFieldError({ value: 0, required: true })).toBe('');
	});
});
