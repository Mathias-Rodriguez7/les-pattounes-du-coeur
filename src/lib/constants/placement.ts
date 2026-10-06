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

type PlacementColors = {
	border: string;
	bg: string;
	dot: string;
	text: string;
	badge: string;
};

// ✅ Couleurs par type (classes Tailwind complètes)
export const PLACEMENT_TYPE_COLORS: Record<PlacementType, PlacementColors> = {
	PROPOSAL: {
		border: 'border-purple-500',
		bg: 'bg-purple-100',
		dot: 'bg-purple-500',
		text: 'text-purple-700',
		badge: 'bg-purple-100 text-purple-800'
	},
	TRANSFER: {
		border: 'border-lime-500',
		bg: 'bg-lime-100',
		dot: 'bg-lime-500',
		text: 'text-lime-700',
		badge: 'bg-lime-100 text-lime-800'
	},
	LONG: {
		border: 'border-sky-500',
		bg: 'bg-sky-100',
		dot: 'bg-sky-500',
		text: 'text-sky-700',
		badge: 'bg-sky-100 text-sky-800'
	},
	SHORT: {
		border: 'border-amber-500',
		bg: 'bg-amber-100',
		dot: 'bg-amber-500',
		text: 'text-amber-700',
		badge: 'bg-amber-100 text-amber-800'
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
