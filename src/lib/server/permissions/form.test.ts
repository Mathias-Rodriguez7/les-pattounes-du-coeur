import { describe, expect, it, vi } from 'vitest';

// form.ts importe canManageCat (qui lit la base) : on ne teste ici que canAssignForm, sans base
vi.mock('./cat', () => ({ canManageCat: vi.fn() }));

import { assignRights, canAssignForm } from './form';
import type { AppUser } from '#lib/types/user.ts';

const user = (role: AppUser['role']): AppUser => ({
	id: 'u1',
	role,
	profil: { firstName: 'Léa', lastName: 'Martin', email: 'lea@test.com' }
});

const ME = 'u1';
const flexible = (assignedToId: string | null) =>
	({ type: 'ADOPTION_FLEXIBLE', assignedToId }) as const;

describe('canAssignForm', () => {
	it('demande libre à personne : chacune la prend… pour elle-même seulement', () => {
		expect(canAssignForm(user('MANAGER'), flexible(null), ME)).toBe(true);
		expect(canAssignForm(user('MANAGER'), flexible(null), 'u2')).toBe(false);
	});

	it('demande libre à moi : je la passe à une autre, ou je la libère', () => {
		expect(canAssignForm(user('MANAGER'), flexible(ME), 'u2')).toBe(true);
		expect(canAssignForm(user('MANAGER'), flexible(ME), null)).toBe(true);
	});

	it('demande libre à une autre : je ne peux pas la reprendre', () => {
		expect(canAssignForm(user('MANAGER'), flexible('u2'), ME)).toBe(false);
	});

	it('l’admin : tout', () => {
		expect(canAssignForm(user('ADMIN'), flexible('u2'), 'u3')).toBe(true);
		expect(canAssignForm(user('ADMIN'), { type: 'HOST', assignedToId: null }, 'u3')).toBe(true);
	});

	it('demande précise ou autre formulaire : jamais une bénévole', () => {
		expect(
			canAssignForm(user('MANAGER'), { type: 'ADOPTION_SPECIFIC', assignedToId: ME }, 'u2')
		).toBe(false);
		expect(canAssignForm(user('MANAGER'), { type: 'HOST', assignedToId: null }, ME)).toBe(false);
	});
});

describe('assignRights', () => {
	it('pilote les boutons du panneau', () => {
		expect(assignRights(user('MANAGER'), flexible(null))).toEqual({
			canReassign: false,
			canTake: true
		});
		expect(assignRights(user('MANAGER'), flexible(ME))).toEqual({
			canReassign: true,
			canTake: false
		});
		expect(assignRights(user('MANAGER'), flexible('u2'))).toEqual({
			canReassign: false,
			canTake: false
		});
	});
});
