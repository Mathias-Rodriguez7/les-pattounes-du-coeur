import { describe, expect, it, vi, afterEach } from 'vitest';
import { formatAge, getAgeBadge, UNKNOWN_AGE } from './age.ts';

// On fige « aujourd'hui » au 15 juin 2026
const today = new Date(2026, 5, 15);
const monthsAgo = (m: number) => new Date(today.getFullYear(), today.getMonth() - m, 1);

describe('age', () => {
	vi.useFakeTimers();
	vi.setSystemTime(today);
	afterEach(() => vi.setSystemTime(today));

	it('sans date de naissance : âge inconnu (et pas « Chaton »)', () => {
		expect(getAgeBadge(null)).toBe(UNKNOWN_AGE);
		expect(formatAge(null)).toBe(UNKNOWN_AGE);
	});

	it('les badges suivent les seuils 6 mois, 3 ans, 10 ans', () => {
		expect(getAgeBadge(monthsAgo(5))).toBe('Chaton');
		expect(getAgeBadge(monthsAgo(6))).toBe('Junior');
		expect(getAgeBadge(monthsAgo(35))).toBe('Junior');
		expect(getAgeBadge(monthsAgo(36))).toBe('Adulte');
		expect(getAgeBadge(monthsAgo(119))).toBe('Adulte');
		expect(getAgeBadge(monthsAgo(120))).toBe('Senior');
	});

	it('formatAge : mois, puis « 1 an » au singulier', () => {
		expect(formatAge(monthsAgo(0))).toBe('Moins d’un mois');
		expect(formatAge(monthsAgo(4))).toBe('4 mois');
		expect(formatAge(monthsAgo(12))).toBe('1 an');
		expect(formatAge(monthsAgo(30))).toBe('2 ans');
	});
});
