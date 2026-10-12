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
