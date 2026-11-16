import { describe, expect, it } from 'vitest';
import { hashInvitationToken, invitationExpiry, newInvitationToken } from './token';

describe('newInvitationToken', () => {
	it('donne un jeton imprévisible et son empreinte', () => {
		const a = newInvitationToken();
		const b = newInvitationToken();
		expect(a.token).not.toBe(b.token);
		expect(a.token.length).toBeGreaterThanOrEqual(43); // 32 octets en base64url
		expect(a.tokenHash).toMatch(/^[0-9a-f]{64}$/);
	});

	it('l’empreinte ne révèle pas le jeton, mais le retrouve', () => {
		const { token, tokenHash } = newInvitationToken();
		expect(tokenHash).not.toContain(token);
		expect(hashInvitationToken(token)).toBe(tokenHash);
	});
});

describe('invitationExpiry', () => {
	it('expire 14 jours plus tard', () => {
		const now = new Date('2026-11-16T10:00:00Z');
		expect(invitationExpiry(now).toISOString()).toBe('2026-11-30T10:00:00.000Z');
	});
});
