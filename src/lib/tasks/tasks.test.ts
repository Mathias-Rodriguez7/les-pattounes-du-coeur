import { describe, expect, it } from 'vitest';
import {
	buildTasks,
	formatDuration,
	groupByUrgency,
	visibleTasks,
	type TaskCat,
	type TaskSources
} from './tasks.ts';

const NOW = new Date('2026-11-17T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(NOW.getTime() - ms);

const empty = (): TaskSources => ({
	sos: [],
	adoptions: [],
	forms: [],
	cats: [],
	invitations: [],
	volunteers: []
});

// Un chat complet, dans une FA, suivi par Julie : aucune tâche
const cat = (overrides: Partial<TaskCat> = {}): TaskCat => ({
	id: 'cat-1',
	name: 'Figue',
	status: 'AVAILABLE',
	createdAt: ago(30 * DAY),
	isVisible: false,
	publishedAt: null,
	sex: 'FEMALE',
	origin: 'SOS Celleneuve',
	description: 'Très câline',
	vaccinate: 'YES',
	volunteerIds: ['julie'],
	hasHome: true,
	openProposals: [],
	pendingRequests: 0,
	...overrides
});

const rules = (sources: TaskSources) =>
	buildTasks(sources, NOW).map((t) => `${t.rule}:${t.urgency}`);

describe('formatDuration', () => {
	it('en heures sous 2 jours, en jours au-delà', () => {
		expect(formatDuration(26 * HOUR)).toBe('26 h');
		expect(formatDuration(3 * DAY)).toBe('3 jours');
	});
});

describe('SOS', () => {
	const sos = (overrides = {}) => ({
		id: 'sos-1',
		reportedAt: ago(2 * HOUR),
		updatedAt: ago(2 * HOUR),
		status: 'NEW' as const,
		handledById: null,
		city: 'Montpellier',
		catCount: 0,
		...overrides
	});

	it('S1 : à prendre, urgent après 24 h', () => {
		expect(rules({ ...empty(), sos: [sos()] })).toEqual(['S1:WEEK']);
		expect(rules({ ...empty(), sos: [sos({ reportedAt: ago(25 * HOUR) })] })).toEqual([
			'S1:URGENT'
		]);
	});

	it('S2 : en cours sans chat ni changement depuis 7 jours, pour celle qui le traite', () => {
		const stale = sos({ status: 'IN_PROGRESS', handledById: 'julie', updatedAt: ago(8 * DAY) });
		const [task] = buildTasks({ ...empty(), sos: [stale] }, NOW);
		expect(task.rule).toBe('S2');
		expect(task.audience).toEqual({ kind: 'VOLUNTEERS', ids: ['julie'] });
		// Avec un chat créé : plus de tâche
		expect(rules({ ...empty(), sos: [{ ...stale, catCount: 1 }] })).toEqual([]);
	});
});

describe('Adoptions', () => {
	const adoption = (trialEndsAt: Date) => ({
		catId: 'cat-1',
		catName: 'Figue',
		trialEndsAt,
		volunteerIds: ['julie']
	});

	it('A1 : essai terminé → urgent ; A2 : fin dans moins de 7 jours', () => {
		expect(rules({ ...empty(), adoptions: [adoption(ago(3 * DAY))] })).toEqual(['A1:URGENT']);
		expect(rules({ ...empty(), adoptions: [adoption(ago(-5 * DAY))] })).toEqual(['A2:WATCH']);
		expect(rules({ ...empty(), adoptions: [adoption(ago(-20 * DAY))] })).toEqual([]);
	});

	it('A3 : demande assignée, urgente après 5 jours ; pas assignée : pas de tâche', () => {
		const form = {
			id: 'f1',
			type: 'ADOPTION_SPECIFIC' as const,
			createdAt: ago(6 * DAY),
			assignedToId: 'julie',
			personName: 'Jean D.',
			catName: 'Figue'
		};
		expect(rules({ ...empty(), forms: [form] })).toEqual(['A3:URGENT']);
		expect(rules({ ...empty(), forms: [{ ...form, assignedToId: null }] })).toEqual([]);
	});
});

describe('Chats', () => {
	it('un chat complet, dans une FA, suivi : aucune tâche', () => {
		expect(rules({ ...empty(), cats: [cat()] })).toEqual([]);
	});

	it("C1 sans FA, C3 sans bénévole : pour l'admin", () => {
		const tasks = buildTasks(
			{ ...empty(), cats: [cat({ hasHome: false, volunteerIds: [] })] },
			NOW
		);
		expect(tasks.map((t) => t.rule).sort()).toEqual(['C1', 'C3']);
		expect(tasks.every((t) => t.audience.kind === 'ADMIN')).toBe(true);
	});

	it('C2 : une proposition sans réponse depuis 3 jours', () => {
		expect(rules({ ...empty(), cats: [cat({ openProposals: [ago(4 * DAY)] })] })).toEqual([
			'C2:WATCH'
		]);
		expect(rules({ ...empty(), cats: [cat({ openProposals: [ago(1 * DAY)] })] })).toEqual([]);
	});

	it('C4 : les champs manquants, seulement après 7 jours', () => {
		const incomplete = cat({ sex: 'UNKNOWN', origin: null });
		const [task] = buildTasks({ ...empty(), cats: [incomplete] }, NOW);
		expect(task.detail).toBe('Il manque : sexe, origine');
		expect(rules({ ...empty(), cats: [{ ...incomplete, createdAt: ago(2 * DAY) }] })).toEqual([]);
	});

	it('C6 : visible depuis 6 semaines sans demande, pour admin et communication', () => {
		const visible = cat({ isVisible: true, publishedAt: ago(50 * DAY) });
		const [task] = buildTasks({ ...empty(), cats: [visible] }, NOW);
		expect(task.rule).toBe('C6');
		expect(task.audience.kind).toBe('ADMIN_COMMUNICATION');
		expect(rules({ ...empty(), cats: [{ ...visible, pendingRequests: 1 }] })).toEqual([]);
	});

	it('les chats libres, adoptés ou décédés ne donnent pas de tâche', () => {
		const statuses = ['FREE', 'ADOPTED', 'DEAD'] as const;
		const cats = statuses.map((status, i) => cat({ id: `c${i}`, status, hasHome: false }));
		expect(rules({ ...empty(), cats })).toEqual([]);
	});
});

describe('Invitations et surcharge', () => {
	it('F2 / B2 : une invitation expirée', () => {
		const invitations = [
			{ id: 'i1', kind: 'HOST' as const, name: 'Ana P.', expiresAt: ago(DAY) },
			{ id: 'i2', kind: 'VOLUNTEER' as const, name: 'Léo M.', expiresAt: ago(-DAY) }
		];
		expect(rules({ ...empty(), invitations })).toEqual(['F2:WATCH']);
	});

	it('B3 : plus de 20 tâches urgentes pour une bénévole', () => {
		const adoptions = Array.from({ length: 21 }, (_, i) => ({
			catId: `cat-${i}`,
			catName: `Chat ${i}`,
			trialEndsAt: ago(DAY),
			volunteerIds: ['julie']
		}));
		const volunteers = [{ id: 'julie', name: 'Julie Martin' }];
		const tasks = buildTasks({ ...empty(), adoptions, volunteers }, NOW);
		expect(tasks.filter((t) => t.rule === 'B3')).toHaveLength(1);
		expect(rules({ ...empty(), adoptions: adoptions.slice(1), volunteers })).not.toContain(
			'B3:WEEK'
		);
	});
});

describe('visibleTasks', () => {
	const sources: TaskSources = {
		...empty(),
		sos: [
			{
				id: 's',
				reportedAt: ago(HOUR),
				updatedAt: ago(HOUR),
				status: 'NEW',
				handledById: null,
				city: null,
				catCount: 0
			}
		],
		adoptions: [{ catId: 'a', catName: 'A', trialEndsAt: ago(DAY), volunteerIds: ['julie'] }],
		cats: [
			cat({ id: 'b', hasHome: false }),
			cat({ id: 'c', isVisible: true, publishedAt: ago(60 * DAY) })
		]
	};
	const tasks = buildTasks(sources, NOW);
	const ids = (list: { rule: string }[]) => list.map((t) => t.rule).sort();

	it("une bénévole : ses tâches et celles de l'asso", () => {
		expect(ids(visibleTasks(tasks, { id: 'julie', role: 'MANAGER' }))).toEqual(['A1', 'S1']);
		expect(ids(visibleTasks(tasks, { id: 'paul', role: 'MANAGER' }))).toEqual(['S1']);
	});

	it('une bénévole communication voit aussi « Mettre en avant »', () => {
		expect(ids(visibleTasks(tasks, { id: 'paul', role: 'COMMUNICATION' }))).toEqual(['C6', 'S1']);
	});

	it("l'admin : les siennes, toutes, ou celles d'une bénévole", () => {
		const admin = { id: 'admin', role: 'ADMIN' as const };
		expect(ids(visibleTasks(tasks, admin))).toEqual(['C1', 'C6', 'S1']);
		expect(visibleTasks(tasks, admin, { kind: 'ALL' })).toHaveLength(tasks.length);
		expect(ids(visibleTasks(tasks, admin, { kind: 'VOLUNTEER', id: 'julie' }))).toEqual(['A1']);
	});
});

describe('groupByUrgency', () => {
	it("urgent d'abord, la situation la plus ancienne en premier", () => {
		const sos = [3, 30].map((hours, i) => ({
			id: `s${i}`,
			reportedAt: ago(hours * HOUR),
			updatedAt: ago(hours * HOUR),
			status: 'NEW' as const,
			handledById: null,
			city: null,
			catCount: 0
		}));
		const groups = groupByUrgency(buildTasks({ ...empty(), sos }, NOW));
		expect(groups.map((g) => g.urgency)).toEqual(['URGENT', 'WEEK']);
	});
});
