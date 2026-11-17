import type { CatFull } from '#lib/types/cat.ts';

// Les champs d'un chat libre, communs à la création et à la modification (FreeCatFields)

/** 'NONE' : pas d'identification (le select ne sait pas revenir à '') */
export type IdentificationChoice = 'NONE' | 'CHIP' | 'TATTOO';

export type FreeCatFormFields = {
	sex: string;
	identificationKind: IdentificationChoice;
	identificationNumber: string;
	catNumber: string;
	payer: string;
	payerOther: string;
	address: string;
	city: string;
	postalCode: string;
	district: string | null;
	latitude: number | null;
	longitude: number | null;
	feederName: string;
	feederContact: string;
	notes: string;
};

export function emptyFreeCatFields(): FreeCatFormFields {
	return {
		sex: '',
		identificationKind: 'NONE',
		identificationNumber: '',
		catNumber: '',
		payer: '',
		payerOther: '',
		address: '',
		city: '',
		postalCode: '',
		district: null,
		latitude: null,
		longitude: null,
		feederName: '',
		feederContact: '',
		notes: ''
	};
}

/** Les valeurs actuelles d'un chat libre, pour le modifier */
export function freeCatFieldsFrom(cat: CatFull): FreeCatFormFields {
	const info = cat.freeInfo;
	const identificationKind: IdentificationChoice = cat.chipId
		? 'CHIP'
		: cat.tattooId
			? 'TATTOO'
			: 'NONE';
	return {
		sex: cat.sex,
		identificationKind,
		identificationNumber: cat.chipId ?? cat.tattooId ?? '',
		catNumber: cat.catNumber ?? '',
		payer: info?.payer ?? '',
		payerOther: info?.payerOther ?? '',
		address: info?.address ?? '',
		city: info?.city ?? '',
		postalCode: info?.postalCode ?? '',
		district: info?.district ?? null,
		latitude: info?.latitude ?? null,
		longitude: info?.longitude ?? null,
		feederName: info?.feederName ?? '',
		feederContact: info?.feederContact ?? '',
		notes: info?.notes ?? ''
	};
}
