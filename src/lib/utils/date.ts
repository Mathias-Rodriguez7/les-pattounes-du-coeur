export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	}).format(date);
}
