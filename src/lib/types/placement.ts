import type { Placement } from '@prisma/client';
import type { Cat } from './cat';
import type { HostFull } from './host';

export type PlacementFull = Placement & {
	cat?: Cat | null;
	host?: HostFull;
};

export type PlacementStats = {
	longPlacements: PlacementFull[];
	shortPlacements: PlacementFull[];
	activePlacements: PlacementFull[];
	historicalPlacements: PlacementFull[];
	totalActive: number;
	totalHistorical: number;
};
