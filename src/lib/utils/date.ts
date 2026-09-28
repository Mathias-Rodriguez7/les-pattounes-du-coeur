export function formatDate(date: Date | null): string {
	if (!date) return '—';
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

export function formatDateNum(date: Date | null): string {
	if (!date) return '—';
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
}
