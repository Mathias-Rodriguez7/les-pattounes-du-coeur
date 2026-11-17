import { describe, expect, it } from 'vitest';
import { convertFreeCatSchema, createFreeCatSchema } from './freeCat.ts';

// Un chat libre valide : la commune paye, le vétérinaire est dans la liste
const valid = {
	sex: 'FEMALE',
	identificationKind: '',
	identificationNumber: '',
	catNumber: '',
	payer: 'MONTPELLIER',
	payerOther: '',
	sterilizedAt: '2026-11-12',
	veterinarianId: '6f1c2b8e-3d4a-4c5b-9e6f-7a8b9c0d1e2f',
	veterinary: '',
	address: 'Parc de la Guirlande',
	city: 'Montpellier',
	postalCode: '',
	district: '',
	latitude: '',
	longitude: '',
	feederName: 'Mme Garcia',
	feederContact: '06 12 34 56 78',
	notes: ''
};

const issuePaths = (data: Record<string, unknown>) => {
	const result = createFreeCatSchema.safeParse(data);
	return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('createFreeCatSchema', () => {
	it('accepte un chat libre complet, sans identification ni N° Pattounes', () => {
		const result = createFreeCatSchema.safeParse(valid);
		expect(result.success).toBe(true);
		expect(result.data?.catNumber).toBeNull();
		expect(result.data?.identificationKind).toBeNull();
	});

	it("exige le N° Pattounes quand l'asso paye", () => {
		expect(issuePaths({ ...valid, payer: 'ASSO' })).toContain('catNumber');
		expect(issuePaths({ ...valid, payer: 'ASSO', catNumber: 'C2511004' })).toEqual([]);
	});

	it('exige le nom du payeur pour « Autre »', () => {
		expect(issuePaths({ ...valid, payer: 'OTHER' })).toContain('payerOther');
	});

	it('exige un vétérinaire : de la liste, ou saisi à la main', () => {
		expect(issuePaths({ ...valid, veterinarianId: '' })).toContain('veterinarianId');
		expect(issuePaths({ ...valid, veterinarianId: '', veterinary: 'Clinique X' })).toEqual([]);
	});

	it('exige le numéro quand une identification est choisie', () => {
		expect(issuePaths({ ...valid, identificationKind: 'TATTOO' })).toContain(
			'identificationNumber'
		);
	});

	it('exige le lieu et la ville du relâchage, et le nourrisseur', () => {
		const paths = issuePaths({
			...valid,
			address: '',
			city: ' ',
			feederName: '',
			feederContact: ''
		});
		expect(paths).toEqual(
			expect.arrayContaining(['address', 'city', 'feederName', 'feederContact'])
		);
	});
});

describe('convertFreeCatSchema', () => {
	it('refuse de rester « Libre »', () => {
		const catId = valid.veterinarianId;
		expect(convertFreeCatSchema.safeParse({ catId, status: 'FREE' }).success).toBe(false);
		expect(convertFreeCatSchema.safeParse({ catId, status: 'SOCIALIZE' }).success).toBe(true);
	});
});
