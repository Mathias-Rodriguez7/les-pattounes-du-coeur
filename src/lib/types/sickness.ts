import type { SicknessStatus } from '@prisma/client';

export interface Sickness {
	id: string;
	catId: string;
	name: string;
	description: string | null;
	treatment: string | null;
	startDate: Date | null;
	endDate: Date | null;
	status: SicknessStatus;
	createdAt: Date;
	updatedAt: Date;
}

// Données utilisées côté formulaire (édition inline)
export interface SicknessFormData {
	id?: string; // undefined = nouvelle maladie non encore sauvegardée
	name: string;
	description: string | null;
	treatment: string | null;
	startDate: Date | null;
	endDate: Date | null;
	status: SicknessStatus;
}

export function sicknessToFormData(sickness: Sickness): SicknessFormData {
	return {
		id: sickness.id,
		name: sickness.name,
		description: sickness.description,
		treatment: sickness.treatment,
		startDate: sickness.startDate,
		endDate: sickness.endDate,
		status: sickness.status
	};
}

export function createEmptySicknessFormData(): SicknessFormData {
	return {
		id: undefined,
		name: '',
		description: null,
		treatment: null,
		startDate: null,
		endDate: null,
		status: 'ACTIVE'
	};
}
