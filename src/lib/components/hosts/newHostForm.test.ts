import { describe, expect, it } from 'vitest';
import { emptyNewHostForm, newHostFormFrom, toCreateHostInput } from './newHostForm.ts';

describe('newHostFormFrom (pré-remplissage depuis une demande FA)', () => {
	it('convertit les nombres en texte, comme dans un <input>', () => {
		const form = newHostFormFrom({ space: 45, numberOfCatsAtHome: 2, catAdult: 1 });
		expect(form.space).toBe('45');
		expect(form.numberOfCatsAtHome).toBe('2');
		expect(form.catAdult).toBe('1');
	});

	it('garde les valeurs par défaut pour les champs absents ou null', () => {
		const form = newHostFormFrom({ firstName: 'Léa', city: null });
		expect(form.firstName).toBe('Léa');
		expect(form.city).toBe('Montpellier');
		expect(form.isAvailable).toBe(true);
		expect(form.heal).toBe('NO');
	});

	it('reprend les cases cochées', () => {
		const form = newHostFormFrom({ outside: true, hasAnimalsAtHome: true });
		expect(form.outside).toBe(true);
		expect(form.hasAnimalsAtHome).toBe(true);
		expect(form.car).toBe(false);
	});
});

describe('toCreateHostInput (avant validation)', () => {
	it('retire les espaces et convertit les nombres', () => {
		const input = toCreateHostInput({
			...emptyNewHostForm(),
			firstName: '  Léa ',
			space: '45',
			kitten: ''
		});
		expect(input.firstName).toBe('Léa');
		expect(input.space).toBe(45);
		// Champ vide : 0 chaton accepté (valeur par défaut du schéma)
		expect(input.kitten).toBe(0);
	});

	it('un champ facultatif vide devient undefined (pas une chaîne vide)', () => {
		const input = toCreateHostInput(emptyNewHostForm());
		expect(input.outsideDescription).toBeUndefined();
		expect(input.district).toBeUndefined();
		expect(input.numberOfCatsAtHome).toBeNull();
	});
});
