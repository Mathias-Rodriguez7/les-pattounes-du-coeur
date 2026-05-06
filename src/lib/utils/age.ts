export function formatAge(months: number): string {
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;

	if (years === 0) return `${remainingMonths} mois`;
	if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`;

	return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`;
}

export function getAgeBadge(months: number): string {
	const years = months / 12;

	if (years < 1) return 'Chaton';
	if (years < 7) return 'Adulte';
	if (years < 10) return 'Senior';
	return 'Super senior';
}
