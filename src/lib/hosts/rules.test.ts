import { describe, expect, it } from 'vitest';
import { applyHostRules, withoutAnimalCounts, withoutOutsideDescription } from './rules.ts';

describe('withoutAnimalCounts', () => {
	it('« pas d’animaux » : efface les nombres et les autres animaux', () => {
		const result = withoutAnimalCounts({
			hasAnimalsAtHome: false,
			numberOfCatsAtHome: 3,
			numberOfDogsAtHome: 1,
			otherAnimalsAtHome: 'Lapin',
			space: 40
		});
		expect(result).toEqual({
			hasAnimalsAtHome: false,
			numberOfCatsAtHome: null,
			numberOfDogsAtHome: null,
			otherAnimalsAtHome: null,
			space: 40
		});
	});

	it('« des animaux » : ne touche à rien', () => {
		const data = { hasAnimalsAtHome: true, numberOfCatsAtHome: 3 };
		expect(withoutAnimalCounts(data)).toBe(data);
	});

	it('champ absent (modification partielle) : ne touche à rien', () => {
		const data = { space: 40, numberOfCatsAtHome: 3 };
		expect(withoutAnimalCounts(data)).toBe(data);
	});
});

describe('withoutOutsideDescription', () => {
	it('« pas d’extérieur » : efface la description de l’extérieur', () => {
		expect(withoutOutsideDescription({ outside: false, outsideDescription: 'Jardin' })).toEqual({
			outside: false,
			outsideDescription: null
		});
	});

	it('« extérieur » ou champ absent : ne touche à rien', () => {
		const withOutside = { outside: true, outsideDescription: 'Jardin' };
		const partial = { space: 40 };
		expect(withoutOutsideDescription(withOutside)).toBe(withOutside);
		expect(withoutOutsideDescription(partial)).toBe(partial);
	});
});

describe('applyHostRules', () => {
	it('applique toutes les règles', () => {
		const result = applyHostRules({
			hasAnimalsAtHome: false,
			numberOfCatsAtHome: 2,
			outside: false,
			outsideDescription: 'Balcon'
		});
		expect(result.numberOfCatsAtHome).toBeNull();
		expect(result.outsideDescription).toBeNull();
	});
});
