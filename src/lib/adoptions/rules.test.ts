import { describe, expect, it } from 'vitest';
import { applyAdoptionRules } from './rules.ts';

describe('applyAdoptionRules', () => {
	it('pas d’extérieur ni d’animaux : efface ce qui en dépend', () => {
		const result = applyAdoptionRules({
			hasGarden: false,
			gardenSize: 100,
			hasPets: false,
			numberOfCats: 2,
			otherPets: 'Lapin',
			housingSize: 60
		});
		expect(result).toMatchObject({
			gardenSize: null,
			numberOfCats: 0,
			numberOfDogs: 0,
			otherPets: null,
			housingSize: 60
		});
	});

	it('cases cochées ou absentes : ne touche à rien', () => {
		const data = { hasGarden: true, gardenSize: 100, numberOfCats: 2 };
		expect(applyAdoptionRules(data)).toEqual(data);
	});
});
