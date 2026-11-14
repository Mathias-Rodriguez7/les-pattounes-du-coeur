import { describe, expect, it } from 'vitest';
import { defaultRejectMessage, hasPlaceholder, REJECT_PLACEHOLDER } from './rejectMessage';

describe('defaultRejectMessage', () => {
	it('salue la personne et nomme le chat', () => {
		const message = defaultRejectMessage('Léa Martin', 'Caramel');
		expect(message.startsWith('Bonjour Léa Martin,')).toBe(true);
		expect(message).toContain('demande d’adoption de Caramel.');
	});

	it('sans nom ni chat : un message qui reste correct', () => {
		const message = defaultRejectMessage('', null);
		expect(message.startsWith('Bonjour,')).toBe(true);
		expect(message).toContain('demande d’adoption. Après étude');
	});

	it('contient le passage à compléter', () => {
		expect(hasPlaceholder(defaultRejectMessage('Léa', 'Caramel'))).toBe(true);
	});
});

describe('hasPlaceholder', () => {
	it('détecte le passage oublié, accepte un message complété', () => {
		expect(hasPlaceholder(`Bonjour,\n${REJECT_PLACEHOLDER}`)).toBe(true);
		expect(hasPlaceholder('Bonjour,\nLe logement n’est pas adapté.')).toBe(false);
	});
});
