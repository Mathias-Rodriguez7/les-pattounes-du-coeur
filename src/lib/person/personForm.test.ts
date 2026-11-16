import { describe, expect, it } from 'vitest';
import {
	emptyPersonForm,
	personDataFromProfil,
	personFormFrom,
	toPersonInput
} from './personForm.ts';
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

describe('personDataFromProfil', () => {
	it('ne garde que les champs « personne » du profil', () => {
		const profil = {
			id: 'p1',
			firstName: 'Léa',
			lastName: 'Martin',
			birthDate: new Date('1990-05-01'),
			email: 'lea@test.com',
			phone: '0612345678',
			address: '1 rue du Chat',
			city: 'Montpellier',
			postalCode: '34000',
			district: 'CENTRE_VILLE',
			createdAt: new Date()
		};
		const data = personDataFromProfil(profil);
		expect(data).not.toHaveProperty('id');
		expect(data).not.toHaveProperty('createdAt');
		expect(personFormFrom(data).email).toBe('lea@test.com');
		expect(personFormFrom(data).district).toBe('CENTRE_VILLE');
	});
});
