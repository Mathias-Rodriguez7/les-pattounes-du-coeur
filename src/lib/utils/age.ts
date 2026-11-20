export function getAgeInMonths(birthDate: Date | null): number {
	if (!birthDate) return 0;
	const now = new Date();
	const birth = new Date(birthDate);
	return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

/** Sans date de naissance : on ne devine pas (avant, un chat sans date passait pour un chaton) */
export const UNKNOWN_AGE = 'Âge inconnu';

export function formatAge(birthDate: Date | null): string {
	if (!birthDate) return UNKNOWN_AGE;
	const months = getAgeInMonths(birthDate);

	// Né ce mois-ci
	if (months < 1) return 'Moins d’un mois';
	// Entre 0 et 1 an : affiche le nombre de mois
	if (months < 12) return `${months} mois`;

	// À partir de 1 an : affiche seulement le nombre d'années (« 1 an », « 3 ans »)
	const years = Math.floor(months / 12);
	return years === 1 ? '1 an' : `${years} ans`;
}

/** Chaton (< 6 mois), Junior (< 3 ans), Adulte (< 10 ans), Senior — ou « Âge inconnu » */
export function getAgeBadge(birthDate: Date | null): string {
	if (!birthDate) return UNKNOWN_AGE;
	const months = getAgeInMonths(birthDate);
	if (months < 6) return 'Chaton';
	if (months < 36) return 'Junior';
	if (months < 120) return 'Adulte';
	return 'Senior';
}
