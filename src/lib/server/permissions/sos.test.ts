import { describe, expect, it } from 'vitest';
import { canHandleSos, canSeeReporter, canTakeSos } from './sos';

const admin = { id: 'a', role: 'ADMIN' as const };
const lea = { id: 'lea', role: 'MANAGER' as const };
const zoe = { id: 'zoe', role: 'MANAGER' as const };

const newSos = { status: 'NEW', handledById: null };
const leaSos = { status: 'IN_PROGRESS', handledById: 'lea' };

describe('SOS : droits', () => {
	it('le contact : admin et bénévole qui traite seulement', () => {
		expect(canSeeReporter(admin, newSos)).toBe(true);
		expect(canSeeReporter(lea, leaSos)).toBe(true);
		expect(canSeeReporter(zoe, leaSos)).toBe(false);
		expect(canSeeReporter(lea, newSos)).toBe(false);
	});

	it('prendre en charge : seulement un SOS à traiter, libre', () => {
		expect(canTakeSos(zoe, newSos)).toBe(true);
		expect(canTakeSos(zoe, leaSos)).toBe(false);
	});

	it('traiter : celle qui le traite, ou l’admin', () => {
		expect(canHandleSos(lea, leaSos)).toBe(true);
		expect(canHandleSos(zoe, leaSos)).toBe(false);
		expect(canHandleSos(admin, newSos)).toBe(true);
		expect(canHandleSos(lea, newSos)).toBe(false);
	});
});
