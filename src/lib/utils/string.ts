// src/lib/utils/string.ts
export function truncate(text: string | null | undefined, max: number): string {
	if (!text) return '';
	return text.length > max ? text.slice(0, max) + '…' : text;
}
