import { describe, expect, it } from 'vitest';
import { buildBoard, countByUrgency, sortTasks, tasksByVolunteer } from './board.ts';
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

type Board = ReturnType<typeof buildBoard>;
const cards = (board: Board) => board.map((card) => card.key);
const rows = (board: Board, key: string) =>
	board.find((card) => card.key === key)?.rows.map((row) => row.key);

describe('buildBoard', () => {
	it('le tableau Admin : SOS, placements, candidatures', () => {
		const board = buildBoard([], 'ADMIN');
		expect(cards(board)).toEqual(['sos', 'cats', 'applications']);
		expect(rows(board, 'cats')).toHaveLength(6);
		expect(rows(board, 'applications')).toEqual([
			'apply-host-assign',
			'apply-volunteer',
			'host-contract',
			'invitations',
			'overload'
		]);
	});

	it("le tableau d'une bénévole : SOS, ses chats, ses adoptions", () => {
		const board = buildBoard([], 'VOLUNTEER', { role: 'MANAGER' });
		expect(cards(board)).toEqual(['sos', 'cats', 'health', 'adoptions', 'applications']);
		expect(rows(board, 'cats')).toEqual(['cat-profile', 'cat-ready']);
	});

	it('une bénévole communication a aussi « À mettre en avant »', () => {
		const board = buildBoard([], 'VOLUNTEER', { role: 'COMMUNICATION' });
		expect(rows(board, 'cats')).toEqual(['cat-profile', 'cat-ready', 'cat-publish', 'cat-promote']);
	});

	it('hideEmpty : seulement les lignes (et les cartes) qui ont des tâches', () => {
		const board = buildBoard([task({ rule: 'A1' })], 'VOLUNTEER', { hideEmpty: true });
		expect(cards(board)).toEqual(['adoptions']);
		expect(rows(board, 'adoptions')).toEqual(['adoption-due']);
	});

	it('la pastille prend la couleur de la tâche la plus pressée', () => {
		const board = buildBoard(
			[task({ id: 'a', urgency: 'WEEK' }), task({ id: 'b', urgency: 'URGENT' })],
			'VOLUNTEER'
		);
		const [newSos, staleSos] = board[0].rows;
		expect(newSos.tasks.map((t) => t.id)).toEqual(['b', 'a']);
		expect(newSos.urgency).toBe('URGENT');
		expect(staleSos.urgency).toBeNull();
	});

	it('la candidature FA à étudier est dans le tableau de la bénévole', () => {
		const board = buildBoard([task({ rule: 'F1' })], 'VOLUNTEER', { hideEmpty: true });
		expect(rows(board, 'applications')).toEqual(['apply-host']);
	});
});

describe('sortTasks, countByUrgency, tasksByVolunteer', () => {
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

	it('range les tâches par bénévole (une tâche partagée compte pour chacune)', () => {
		const byVolunteer = tasksByVolunteer([
			task({ id: 'a', audience: { kind: 'VOLUNTEERS', ids: ['julie', 'paul'] } }),
			task({ id: 'b', audience: { kind: 'VOLUNTEERS', ids: ['julie'] } }),
			task({ id: 'c', audience: { kind: 'ADMIN' } })
		]);
		expect(byVolunteer.julie.map((t) => t.id)).toEqual(['a', 'b']);
		expect(byVolunteer.paul.map((t) => t.id)).toEqual(['a']);
		expect(Object.keys(byVolunteer)).toEqual(['julie', 'paul']);
	});
});
