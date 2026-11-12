import { describe, expect, it } from 'vitest';
import { emptyPersonForm, personFormFrom, toPersonInput } from './personForm.ts';
import {
	toCreateVolunteerInput,
	emptyNewVolunteerForm
} from '#lib/components/volunteers/newVolunteerForm.ts';

describe('personForm', () => {
	it('une personne vide habite Montpellier par défaut', () => {
		expect(emptyPersonForm()).toMatchObject({ city: 'Montpellier', postalCode: '34000' });
	});

	it('pré-remplit depuis une demande, sans perdre les valeurs par défaut', () => {
		const form = personFormFrom({ firstName: 'Léa', postalCode: 34070, city: null });
		expect(form.firstName).toBe('Léa');
		expect(form.postalCode).toBe('34070');
		expect(form.city).toBe('Montpellier');
	});

	it('convertit la date de naissance au format AAAA-MM-JJ', () => {
		const input = toPersonInput({ ...emptyPersonForm(), birthDate: new Date(1990, 4, 17) });
		expect(input.birthDate).toBe('1990-05-17');
	});
});

describe('newVolunteerForm', () => {
	it('la personne + son rôle (MANAGER par défaut)', () => {
		const input = toCreateVolunteerInput({ ...emptyNewVolunteerForm(), firstName: ' Jean ' });
		expect(input).toMatchObject({ firstName: 'Jean', role: 'MANAGER', district: undefined });
	});
});
