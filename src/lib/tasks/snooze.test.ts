import { describe, expect, it } from 'vitest';
import { applySnoozes, type TaskSnoozeView } from './snooze.ts';
import type { Task } from './tasks.ts';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(NOW.getTime() + days * DAY);

const task = (id: string, urgency: Task['urgency']): Task => ({
	id,
	rule: 'C4',
	title: 'Compléter la fiche',
	detail: '',
	short: '',
	badge: null,
	urgency,
	audience: { kind: 'VOLUNTEERS', ids: ['julie'] },
	link: { kind: 'cat', id: 'x' },
	action: 'Ouvrir',
	since: NOW
});

const snooze = (
	taskId: string,
	days: number,
	urgency: Task['urgency'] = 'WATCH'
): TaskSnoozeView => ({
	taskId,
	until: inDays(days),
	note: 'rdv véto',
	urgency
});

describe('applySnoozes', () => {
	it('une tâche mise de côté sort de la liste, avec sa date et sa note', () => {
		const { active, snoozed } = applySnoozes(
			[task('C4:a', 'WATCH'), task('C4:b', 'WATCH')],
			[snooze('C4:a', 21)],
			NOW
		);
		expect(active.map((t) => t.id)).toEqual(['C4:b']);
		expect(snoozed).toEqual([{ task: task('C4:a', 'WATCH'), until: inDays(21), note: 'rdv véto' }]);
	});

	it('elle revient à la date choisie', () => {
		const { active } = applySnoozes([task('C4:a', 'WATCH')], [snooze('C4:a', -1)], NOW);
		expect(active).toHaveLength(1);
	});

	it('elle revient plus tôt si elle est devenue plus urgente', () => {
		const { active } = applySnoozes([task('A3:a', 'URGENT')], [snooze('A3:a', 7, 'WEEK')], NOW);
		expect(active).toHaveLength(1);
	});

	it('les tâches mises de côté : la date la plus proche d’abord', () => {
		const { snoozed } = applySnoozes(
			[task('C4:a', 'WATCH'), task('C4:b', 'WATCH')],
			[snooze('C4:a', 20), snooze('C4:b', 3)],
			NOW
		);
		expect(snoozed.map((s) => s.task.id)).toEqual(['C4:b', 'C4:a']);
	});
});
