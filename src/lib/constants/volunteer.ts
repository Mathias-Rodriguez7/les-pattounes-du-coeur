export const VOLUNTEER_STATUS_OPTIONS = [
	{ value: 'ACTIVE', label: 'En activité' },
	{ value: 'BREAK', label: 'En pause' },
	{ value: 'STOP', label: 'Arrêté' }
] satisfies Array<{ value: string; label: string }>;

export const VOLUNTEER_ROLE_OPTIONS = [
	{ value: 'ADMIN', label: 'Admin' },
	{ value: 'MANAGER', label: 'Manager' },
	{ value: 'COMMUNICATION', label: 'Communication' }
] satisfies Array<{ value: string; label: string }>;
