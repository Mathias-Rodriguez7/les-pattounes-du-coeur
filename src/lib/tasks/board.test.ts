import { describe, expect, it } from 'vitest';
import { buildBoard, countByUrgency, sortTasks } from './board.ts';
import type { Task } from './tasks.ts';

const task = (overrides: Partial<Task>): Task => ({
	id: 'x',
	rule: 'S1',
	title: 'Titre',
	detail: 'Détail',
	short: 'Court',
	badge: null,
	urgency: 'WEEK',
	audience: { kind: 'ASSO' },
	link: { kind: 'sos', id: 'x' },
	action: 'Ouvrir',
	since: new Date('2026-11-10'),
	...overrides
});

const cards = (board: ReturnType<typeof buildBoard>) => board.map((card) => card.key);
const rows = (board: ReturnType<typeof buildBoard>, key: string) =>
	board.find((card) => card.key === key)?.rows.map((row) => row.key);

describe('buildBoard', () => {
	it("l'admin voit les 4 cartes, toutes les lignes", () => {
		const board = buildBoard([], 'ADMIN');
		expect(cards(board)).toEqual(['sos', 'cats', 'adoptions', 'applications']);
		expect(rows(board, 'cats')).toHaveLength(5);
	});

	it("une bénévole n'a pas la carte Candidatures, ni les lignes de l'admin", () => {
		const board = buildBoard([], 'MANAGER');
		expect(cards(board)).toEqual(['sos', 'cats', 'adoptions']);
		expect(rows(board, 'cats')).toEqual(['cat-profile']);
	});

	it('une bénévole communication a aussi « À mettre en avant »', () => {
		expect(rows(buildBoard([], 'COMMUNICATION'), 'cats')).toEqual(['cat-profile', 'cat-promote']);
	});

	it("l'admin qui regarde une bénévole voit ses lignes à elle", () => {
		const board = buildBoard([], 'ADMIN', { kind: 'VOLUNTEER', id: 'julie' });
		expect(cards(board)).toEqual(['sos', 'cats', 'adoptions']);
	});

	it('la pastille prend la couleur de la tâche la plus pressée', () => {
		const board = buildBoard(
			[task({ id: 'a', urgency: 'WEEK' }), task({ id: 'b', urgency: 'URGENT' })],
			'ADMIN'
		);
		const row = board[0].rows[0];
		expect(row.tasks.map((t) => t.id)).toEqual(['b', 'a']);
		expect(row.urgency).toBe('URGENT');
		expect(board[0].rows[1].urgency).toBeNull();
	});

	it('les invitations FA et bénévoles sont sur la même ligne', () => {
		const board = buildBoard(
			[task({ id: 'f', rule: 'F2' }), task({ id: 'b', rule: 'B2' })],
			'ADMIN'
		);
		const invitations = board
			.find((card) => card.key === 'applications')
			?.rows.find((row) => row.key === 'invitations');
		expect(invitations?.tasks).toHaveLength(2);
	});
});

describe('sortTasks et countByUrgency', () => {
	it("urgent d'abord, puis la plus ancienne", () => {
		const sorted = sortTasks([
			task({ id: 'new', urgency: 'URGENT', since: new Date('2026-11-15') }),
			task({ id: 'watch', urgency: 'WATCH', since: new Date('2026-01-01') }),
			task({ id: 'old', urgency: 'URGENT', since: new Date('2026-11-01') })
		]);
		expect(sorted.map((t) => t.id)).toEqual(['old', 'new', 'watch']);
	});

	it('compte par urgence', () => {
		expect(countByUrgency([task({ urgency: 'URGENT' }), task({ urgency: 'URGENT' })])).toEqual({
			URGENT: 2,
			WEEK: 0,
			WATCH: 0
		});
	});
});
