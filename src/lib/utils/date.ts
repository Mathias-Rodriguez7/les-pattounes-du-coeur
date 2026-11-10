// src/lib/utils/date.ts
export function formatDate(date: Date | string | null | undefined): string {
	if (!date) return 'N/A';

	try {
		// Convertir string ISO en Date
		const dateObj = typeof date === 'string' ? new Date(date) : date;

		// Vérifier que c'est valide
		if (isNaN(dateObj.getTime())) {
			return 'N/A';
		}

		return dateObj.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} catch (error) {
		console.error('formatDate error:', error);
		return 'N/A';
	}
}

export function formatDateNum(date: Date | null): string {
	if (!date) return '—';
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
}

/** Ajoute des mois à une date (sans modifier l'originale) */
export function addMonths(date: Date, months: number): Date {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);
	return result;
}

/**
 * La date du jour À PARIS, à minuit UTC : le même format qu'une colonne @db.Date.
 * Sert à comparer avec trialEndsAt sans décalage de fuseau
 * (entre minuit et 1 h à Paris, new Date() est encore la veille en UTC).
 */
export function todayDateOnly(): Date {
	const parisDay = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' }); // "2026-11-10"
	return new Date(parisDay);
}
