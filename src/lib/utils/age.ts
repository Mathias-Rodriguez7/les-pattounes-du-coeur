function getAgeInMonths(birthDate: Date | null): number {
	if (!birthDate) return 0;
	const now = new Date();
	const birth = new Date(birthDate);
	return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export function formatAge(birthDate: Date | null): string {
	const months = getAgeInMonths(birthDate);
	if (!birthDate || months === 0) return 'Âge inconnu';

	// Entre 0 et 1 an : affiche le nombre de mois
	if (months < 12) return `${months} mois`;

	// À partir de 1 an : affiche seulement le nombre d'années
	const years = Math.floor(months / 12);
	return `${years} ans`;
}

export function getAgeBadge(birthDate: Date | null): string {
	const months = getAgeInMonths(birthDate);
	if (months < 6) return 'Chaton';
	if (months < 36) return 'Junior';
	if (months < 120) return 'Adulte';
	return 'Senior';
}
