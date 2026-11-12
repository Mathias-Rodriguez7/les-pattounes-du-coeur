import { describe, expect, it } from 'vitest';
import { withoutAnimalCounts } from './animals.ts';

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
