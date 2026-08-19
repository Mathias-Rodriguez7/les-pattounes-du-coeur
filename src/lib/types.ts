export type CatStatus = 'AVAILABLE' | 'SOCIALIZE' | 'ADOPTED' | 'FREE';

export interface CatStatusData {
	name: string;
	AVAILABLE: number;
	SOCIALIZE: number;
	ADOPTED: number;
	FREE: number;
}

export type VolunteerStat = {
	volunteerId: string;
	volunteerName: string;
	catsManaged: number;
	catsAdopted: number;
};

export type RadarChartData = {
	volunteer: string;
	AVAILABLE: number;
	SOCIALIZE: number;
	ADOPTED: number;
	FREE: number;
};
