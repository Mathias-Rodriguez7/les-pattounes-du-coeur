import { describe, expect, it } from 'vitest';
import { breakHasStarted, statusWithBreak } from './breaks';

// Le DateRangePicker envoie les dates à midi
const at = (day: string, hour = 12) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`);

describe('breakHasStarted', () => {
	it('une pause qui commence aujourd’hui a commencé, même avant midi', () => {
		expect(breakHasStarted(at('2026-11-20'), at('2026-11-20', 3))).toBe(true);
	});

	it('une pause qui commence demain n’a pas commencé', () => {
		expect(breakHasStarted(at('2026-11-21'), at('2026-11-20', 23))).toBe(false);
	});
});

describe('statusWithBreak', () => {
	const today = at('2026-11-20', 10);

	it('pause dès aujourd’hui → en pause tout de suite', () => {
		expect(statusWithBreak('ACTIVE', at('2026-11-20'), today)).toBe('BREAK');
	});

	it('pause à venir → reste active (le cron s’en chargera)', () => {
		expect(statusWithBreak('ACTIVE', at('2026-12-01'), today)).toBe('ACTIVE');
		expect(statusWithBreak('BREAK', at('2026-12-01'), today)).toBe('ACTIVE');
	});

	it('une bénévole arrêtée le reste', () => {
		expect(statusWithBreak('STOP', at('2026-11-20'), today)).toBe('STOP');
	});

	it('sans statut enregistré : traitée comme active', () => {
		expect(statusWithBreak(null, at('2026-12-01'), today)).toBe('ACTIVE');
	});
});
