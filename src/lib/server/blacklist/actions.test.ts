import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppUser } from '#lib/types/user.ts';

// On remplace les fonctions qui écrivent en base : ces tests vérifient les RÈGLES de l'action
// (qui a le droit, quelles données passent), sans base de données.
vi.mock('./mutations.ts', () => ({
	addToBlacklist: vi.fn(),
	liftBlacklist: vi.fn(),
	BlacklistError: class BlacklistError extends Error {}
}));

const { addToBlacklistAction, liftBlacklistAction } = await import('./actions.ts');
const { addToBlacklist, liftBlacklist } = await import('./mutations.ts');

const admin: AppUser = {
	id: 'admin-id',
	role: 'ADMIN',
	profil: { firstName: 'Mathilde', lastName: 'Admin', email: 'Admin@Pattounes.fr' }
};
const manager: AppUser = { ...admin, id: 'manager-id', role: 'MANAGER' };

/** Simule l'envoi d'un formulaire par la personne connectée */
function submit(user: AppUser | null, fields: Record<string, string>) {
	const body = new FormData();
	for (const [key, value] of Object.entries(fields)) body.set(key, value);
	return {
		request: new Request('http://localhost/dashboard/blacklist', { method: 'POST', body }),
		locals: { user } as App.Locals
	};
}

beforeEach(() => vi.clearAllMocks());

describe('addToBlacklistAction', () => {
	it("refuse une personne qui n'est pas admin", async () => {
		const result = await addToBlacklistAction(
			submit(manager, { email: 'jean@exemple.fr', reason: 'Raison valable' })
		);
		expect(result).toMatchObject({ status: 403 });
		expect(addToBlacklist).not.toHaveBeenCalled();
	});

	it("refuse que l'admin se blackliste elle-même, même avec une autre casse", async () => {
		const result = await addToBlacklistAction(
			submit(admin, { email: ' admin@PATTOUNES.fr ', reason: 'Fausse manipulation' })
		);
		expect(result).toMatchObject({ status: 400 });
		expect(addToBlacklist).not.toHaveBeenCalled();
	});

	it('refuse une raison trop courte', async () => {
		const result = await addToBlacklistAction(
			submit(admin, { email: 'jean@exemple.fr', reason: 'x' })
		);
		expect(result).toMatchObject({ status: 400 });
		expect(addToBlacklist).not.toHaveBeenCalled();
	});

	it("blackliste avec l'email normalisé", async () => {
		const result = await addToBlacklistAction(
			submit(admin, { email: 'Jean@Exemple.fr', reason: 'Chat rendu en mauvais état' })
		);
		expect(result).toMatchObject({ success: true });
		expect(addToBlacklist).toHaveBeenCalledWith({
			email: 'jean@exemple.fr',
			reason: 'Chat rendu en mauvais état'
		});
	});
});

describe('liftBlacklistAction', () => {
	it("refuse une personne qui n'est pas admin", async () => {
		const result = await liftBlacklistAction(
			submit(manager, { email: 'jean@exemple.fr', reason: 'Situation régularisée' })
		);
		expect(result).toMatchObject({ status: 403 });
		expect(liftBlacklist).not.toHaveBeenCalled();
	});

	it("note le nom de l'admin qui lève la blacklist", async () => {
		await liftBlacklistAction(
			submit(admin, { email: 'jean@exemple.fr', reason: 'Situation régularisée' })
		);
		expect(liftBlacklist).toHaveBeenCalledWith(
			{ email: 'jean@exemple.fr', reason: 'Situation régularisée' },
			'Mathilde Admin'
		);
	});
});
