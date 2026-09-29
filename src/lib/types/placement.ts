import type { Placement } from '@prisma/client';
import type { CatFull } from './cat';
import type { HostBasic } from './host';

export type PlacementFull = Placement & {
	cat?: CatFull | null;
	host?: HostBasic;
};

export type PlacementStats = {
	longPlacements: PlacementFull[];
	shortPlacements: PlacementFull[];
	activePlacements: PlacementFull[];
	historicalPlacements: PlacementFull[];
	totalActive: number;
	totalHistorical: number;
};
