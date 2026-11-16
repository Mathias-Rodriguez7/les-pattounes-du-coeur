import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { householdShape, householdSummary, householdTotal, isHouseholdUnknown } from './household';

const schema = z.object(householdShape);

describe('householdShape', () => {
	it('null reste null (pas renseigné), texte → nombre, absent reste absent', () => {
		expect(schema.parse({ adultsAtHome: '2', childrenAtHome: null })).toEqual({
			adultsAtHome: 2,
			childrenAtHome: null
		});
	});

	it('refuse un nombre négatif ou décimal', () => {
		expect(schema.safeParse({ adultsAtHome: '-1' }).success).toBe(false);
		expect(schema.safeParse({ babiesAtHome: '1.5' }).success).toBe(false);
	});
});

describe('householdSummary', () => {
	it('omet les 0 et accorde au pluriel', () => {
		expect(
			householdSummary({ adultsAtHome: 2, teensAtHome: 0, childrenAtHome: 1, babiesAtHome: 2 })
		).toBe('2 adultes · 1 enfant · 2 bébés');
	});

	it('null si rien n’est renseigné, « Personne » si tout vaut 0', () => {
		expect(householdSummary({})).toBeNull();
		expect(householdSummary({ adultsAtHome: 0 })).toBe('Personne');
	});
});

describe('householdTotal / isHouseholdUnknown', () => {
	it('additionne, et vaut -1 sans info (trié en dernier)', () => {
		expect(householdTotal({ adultsAtHome: '2', childrenAtHome: 1 })).toBe(3);
		expect(householdTotal({})).toBe(-1);
		expect(isHouseholdUnknown({ adultsAtHome: null })).toBe(true);
	});
});
