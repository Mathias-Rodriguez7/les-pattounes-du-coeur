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

// ✅ Couleurs par type (classes Tailwind complètes)
export const PLACEMENT_TYPE_COLORS: Record<PlacementType, { border: string; bg: string }> = {
	PROPOSAL: {
		border: 'border-purple-500',
		bg: 'bg-purple-100'
	},
	TRANSFER: {
		border: 'border-lime-500',
		bg: 'bg-lime-100'
	},
	LONG: {
		border: 'border-sky-500',
		bg: 'bg-sky-100'
	},
	SHORT: {
		border: 'border-amber-500',
		bg: 'bg-amber-100'
	}
};

// ✅ Helper pour générer directement la classe combinée
export function getPlacementTypeClass(type: PlacementType): string {
	const c = PLACEMENT_TYPE_COLORS[type];
	return `${c.border} ${c.bg}`;
}

export const PLACEMENT_TYPE_GROUPS = {
	PROPOSAL: ['PROPOSAL'] as PlacementType[],
	TRANSFER: ['TRANSFER'] as PlacementType[],
	LONG: ['LONG'] as PlacementType[],
	SHORT: ['SHORT'] as PlacementType[]
};
