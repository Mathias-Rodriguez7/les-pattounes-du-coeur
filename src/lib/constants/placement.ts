import type { PlacementType } from '@prisma/client';

export const PLACEMENT_STATUS = [
	{ value: 'ACTIVE', label: 'Activite' },
	{ value: 'BREAK', label: 'Pause' },
	{ value: 'STOP', label: 'Terminé' }
] satisfies Array<{ value: string; label: string }>;

export const PLACEMENT_TYPE_LABELS: Record<PlacementType, string> = {
	PROPOSAL: 'Proposition',
	TRANSFER: 'Transfert',
	LONG: 'Classique',
	SHORT: 'Relais'
};

export const PLACEMENT_TYPE_OPTIONS = Object.entries(PLACEMENT_TYPE_LABELS).map(
	([value, label]) => ({ value, label })
);
