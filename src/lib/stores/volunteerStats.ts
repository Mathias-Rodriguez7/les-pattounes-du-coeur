import { writable, derived } from 'svelte/store';

export interface VolunteerStat {
	totalCats: number;
	volunteerCats: number;
	totalAdoptions: number;
	volunteerAdoptions: number;
}

export interface RadarData {
	allCats: {
		AVAILABLE: number;
		SOCIALIZE: number;
		ADOPTED: number;
		FREE: number;
	};
	volunteerCats: {
		AVAILABLE: number;
		SOCIALIZE: number;
		ADOPTED: number;
		FREE: number;
	};
}

export const volunteerStats = writable<VolunteerStat[]>([]);
export const radarChartData = writable<RadarData[]>([]);

export const stats = derived(
	[volunteerStats, radarChartData],
	([$volunteerStats, $radarChartData]) => ({
		totalCats: $volunteerStats.reduce((sum, stat) => sum + stat.totalCats, 0),
		volunteerCats: $volunteerStats.reduce((sum, stat) => sum + stat.volunteerCats, 0),
		totalAdoptions: $volunteerStats.reduce((sum, stat) => sum + stat.totalAdoptions, 0),
		volunteerAdoptions: $volunteerStats.reduce((sum, stat) => sum + stat.volunteerAdoptions, 0),
		allCatsData: {
			AVAILABLE: $radarChartData.reduce((sum, d) => sum + (d.allCats?.AVAILABLE || 0), 0),
			SOCIALIZE: $radarChartData.reduce((sum, d) => sum + (d.allCats?.SOCIALIZE || 0), 0),
			ADOPTED: $radarChartData.reduce((sum, d) => sum + (d.allCats?.ADOPTED || 0), 0),
			FREE: $radarChartData.reduce((sum, d) => sum + (d.allCats?.FREE || 0), 0)
		},
		volunteerCatsData: {
			AVAILABLE: $radarChartData.reduce((sum, d) => sum + (d.volunteerCats?.AVAILABLE || 0), 0),
			SOCIALIZE: $radarChartData.reduce((sum, d) => sum + (d.volunteerCats?.SOCIALIZE || 0), 0),
			ADOPTED: $radarChartData.reduce((sum, d) => sum + (d.volunteerCats?.ADOPTED || 0), 0),
			FREE: $radarChartData.reduce((sum, d) => sum + (d.volunteerCats?.FREE || 0), 0)
		}
	})
);
