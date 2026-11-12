import { describe, expect, it } from 'vitest';
import { addToBlacklistSchema, liftBlacklistSchema } from './blacklist.ts';
import { matchesBlacklistFilter } from '#lib/constants/blacklist.ts';

describe('addToBlacklistSchema', () => {
	it('accepte un email et une raison', () => {
		const result = addToBlacklistSchema.safeParse({
			email: 'jean@exemple.fr',
			reason: 'Chat rendu en mauvais état'
		});
		expect(result.success).toBe(true);
	});

	it("normalise l'email : espaces retirés et minuscules", () => {
		// C'est ce qui permet de comparer « Jean@… » et « jean@… » partout dans l'app
		const result = addToBlacklistSchema.safeParse({
			email: '  Jean.Dupont@Exemple.FR ',
			reason: 'Raison valable'
		});
		expect(result.success && result.data.email).toBe('jean.dupont@exemple.fr');
	});

	it('refuse un email invalide', () => {
		const result = addToBlacklistSchema.safeParse({ email: 'pas-un-email', reason: 'Raison' });
		expect(result.success).toBe(false);
	});

	it.each([
		['vide', ''],
		['que des espaces', '     '],
		['trop courte', 'ok']
	])('refuse une raison %s', (_, reason) => {
		const result = addToBlacklistSchema.safeParse({ email: 'jean@exemple.fr', reason });
		expect(result.success).toBe(false);
		if (!result.success) expect(result.error.issues[0].path).toEqual(['reason']);
	});

	it('retire les espaces autour de la raison', () => {
		const result = addToBlacklistSchema.safeParse({
			email: 'jean@exemple.fr',
			reason: '  Refus de tout contact  '
		});
		expect(result.success && result.data.reason).toBe('Refus de tout contact');
	});
});

describe('liftBlacklistSchema', () => {
	it('exige une raison pour lever la blacklist', () => {
		const result = liftBlacklistSchema.safeParse({ email: 'jean@exemple.fr', reason: '' });
		expect(result.success).toBe(false);
	});

	it('accepte une levée avec sa raison', () => {
		const result = liftBlacklistSchema.safeParse({
			email: 'jean@exemple.fr',
			reason: 'Situation régularisée'
		});
		expect(result.success).toBe(true);
	});
});

describe('matchesBlacklistFilter (filtre des pages Bénévoles et FA)', () => {
	const blacklisted = [{ description: 'Raison', createdAt: new Date() }];

	it('sans filtre : tout le monde passe', () => {
		expect(matchesBlacklistFilter('', blacklisted)).toBe(true);
		expect(matchesBlacklistFilter('', [])).toBe(true);
	});

	it('« Blacklistés » : seulement les personnes blacklistées', () => {
		expect(matchesBlacklistFilter('BLACKLISTED', blacklisted)).toBe(true);
		expect(matchesBlacklistFilter('BLACKLISTED', [])).toBe(false);
		// Donnée non chargée : considérée comme non blacklistée
		expect(matchesBlacklistFilter('BLACKLISTED', undefined)).toBe(false);
	});

	it('« Non blacklistés » : l’inverse', () => {
		expect(matchesBlacklistFilter('NOT_BLACKLISTED', blacklisted)).toBe(false);
		expect(matchesBlacklistFilter('NOT_BLACKLISTED', [])).toBe(true);
	});
});
