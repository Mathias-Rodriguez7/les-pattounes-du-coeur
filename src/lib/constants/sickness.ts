import type { SicknessStatus } from '@prisma/client';

export const sicknessStatus: Record<SicknessStatus, string> = {
	ACTIVE: 'A vie',
	TREATED: 'En traitement',
	RESOLVED: 'Guérie'
};

export const SICKNESS_STATUS = [
	{ value: 'ACTIVE', label: 'A vie' },
	{ value: 'TREATED', label: 'En traitement' },
	{ value: 'RESOLVED', label: 'Guérie' }
];

export const SICKNESS_STATUS_COLOR: Record<string, string> = {
	ACTIVE: 'destructive',
	TREATED: 'warning',
	RESOLVED: 'success'
};
