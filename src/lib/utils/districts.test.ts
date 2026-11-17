import { describe, expect, it } from 'vitest';
import { placeLabel } from './districts';

describe('placeLabel', () => {
	it('le quartier à Montpellier, la ville ailleurs (en italique)', () => {
		expect(placeLabel({ city: 'Montpellier', district: 'MOSSON' })).toEqual({
			label: 'Mosson',
			isCity: false
		});
		expect(placeLabel({ city: 'Lattes', district: null })).toEqual({
			label: 'Lattes',
			isCity: true
		});
		expect(placeLabel({ city: 'Montpellier', district: null })).toEqual({
			label: 'Montpellier',
			isCity: true
		});
		expect(placeLabel({})).toEqual({ label: '—', isCity: false });
	});
});
