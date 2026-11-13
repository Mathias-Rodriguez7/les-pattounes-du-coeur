import { describe, expect, it } from 'vitest';
import { applyVolunteerRules } from './rules.ts';

describe('applyVolunteerRules', () => {
	it('une case d’expérience décochée efface sa description', () => {
		const result = applyVolunteerRules({
			hasCatExperience: false,
			catExperienceDescription: '3 chats pendant 5 ans',
			hasMedicalCareExperience: true,
			medicalCareDescription: 'Infirmière'
		});
		expect(result.catExperienceDescription).toBeNull();
		// Case cochée : la description reste
		expect(result.medicalCareDescription).toBe('Infirmière');
	});

	it('case absente (modification partielle) : ne touche à rien', () => {
		const data = { associationExperienceDescription: 'SPA' };
		expect(applyVolunteerRules(data)).toEqual(data);
	});
});
