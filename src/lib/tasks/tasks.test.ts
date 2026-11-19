import { describe, expect, it } from 'vitest';
import {
	adminTasks,
	buildTasks,
	formatDuration,
	formatShort,
	tasksOf,
	volunteerTasks,
	type TaskCat,
	type TaskForm,
	type TaskSos,
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

// Un chat complet, adulte, stérilisé, identifié, dans une FA, suivi par Julie : aucune tâche
const cat = (overrides: Partial<TaskCat> = {}): TaskCat => ({
	id: 'cat-1',
	name: 'Figue',
	status: 'AVAILABLE',
	createdAt: ago(30 * DAY),
	isVisible: false,
	publishedAt: null,
	realName: 'Figue',
	hasPhoto: true,
	birthDate: ago(400 * DAY),
	sex: 'FEMALE',
	color: 'Tigrée',
	hairLength: 'SHORT',
	origin: 'SOS Celleneuve',
	description: 'Très câline',
	vaccinate: 'YES',
	isSterilized: true,
	isIdentified: true,
	vaccineDueAt: null,
	volunteerIds: ['julie'],
	hasHome: true,
	openProposals: [],
	pendingRequests: 0,
	...overrides
});

const sos = (overrides: Partial<TaskSos> = {}): TaskSos => ({
	id: 'sos-1',
	reportedAt: ago(2 * HOUR),
	updatedAt: ago(2 * HOUR),
	status: 'NEW',
	handledById: null,
	city: 'Montpellier',
	catCount: 0,
	...overrides
});

const form = (overrides: Partial<TaskForm> = {}): TaskForm => ({
	id: 'f1',
	type: 'ADOPTION_SPECIFIC',
	createdAt: ago(2 * DAY),
	assignedToId: 'julie',
	personName: 'Jean D.',
	catName: 'Figue',
	catVolunteerIds: [],
	...overrides
});

const rules = (sources: TaskSources) =>
	buildTasks(sources, NOW).map((t) => `${t.rule}:${t.urgency}`);

describe('formatDuration et formatShort', () => {
	it('en heures sous 2 jours, en jours au-delà', () => {
		expect(formatDuration(26 * HOUR)).toBe('26 h');
		expect(formatDuration(3 * DAY)).toBe('3 jours');
		expect(formatShort(7 * HOUR)).toBe('7 h');
		expect(formatShort(3 * DAY)).toBe('3 j');
	});
});

describe('SOS', () => {
	it('S1 : à prendre, urgent après 24 h', () => {
		expect(rules({ ...empty(), sos: [sos()] })).toEqual(['S1:WEEK']);
		expect(rules({ ...empty(), sos: [sos({ reportedAt: ago(25 * HOUR) })] })).toEqual([
			'S1:URGENT'
		]);
	});

	it('S2 : aussi pour les bénévoles en renfort', () => {
		const stale = sos({
			status: 'IN_PROGRESS',
			handledById: 'julie',
			helperIds: ['paul'],
			updatedAt: ago(8 * DAY)
		});
		const [task] = buildTasks({ ...empty(), sos: [stale] }, NOW);
		expect(task.audience).toEqual({ kind: 'VOLUNTEERS', ids: ['julie', 'paul'] });
	});

	it('S2 : en cours sans chat ni changement depuis 7 jours, pour celle qui le traite', () => {
		const stale = sos({ status: 'IN_PROGRESS', handledById: 'julie', updatedAt: ago(8 * DAY) });
		const [task] = buildTasks({ ...empty(), sos: [stale] }, NOW);
		expect(task.rule).toBe('S2');
		expect(task.audience).toEqual({ kind: 'VOLUNTEERS', ids: ['julie'] });
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

	it('A1 : essai terminé → cette semaine ; A2 : fin dans moins de 7 jours', () => {
		expect(rules({ ...empty(), adoptions: [adoption(ago(3 * DAY))] })).toEqual(['A1:WEEK']);
		expect(rules({ ...empty(), adoptions: [adoption(ago(-5 * DAY))] })).toEqual(['A2:WATCH']);
		expect(rules({ ...empty(), adoptions: [adoption(ago(-20 * DAY))] })).toEqual([]);
	});

	it('A3 : demande assignée, urgente après 5 jours ; pas assignée : pas de tâche', () => {
		expect(rules({ ...empty(), forms: [form({ createdAt: ago(6 * DAY) })] })).toEqual([
			'A3:URGENT'
		]);
		expect(rules({ ...empty(), forms: [form({ assignedToId: null })] })).toEqual([]);
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

	it('C2 : « relancer ou annuler » une proposition sans réponse depuis 3 jours', () => {
		const [task] = buildTasks({ ...empty(), cats: [cat({ openProposals: [ago(4 * DAY)] })] }, NOW);
		expect(task.title).toBe('Relancer ou annuler les FA contactées pour Figue');
		expect(rules({ ...empty(), cats: [cat({ openProposals: [ago(DAY)] })] })).toEqual([]);
	});

	it('C4 : les champs manquants, seulement après 7 jours', () => {
		const incomplete = cat({ sex: 'UNKNOWN', origin: null });
		const [task] = buildTasks({ ...empty(), cats: [incomplete] }, NOW);
		expect(task.detail).toBe('Il manque : sexe, origine');
		expect(rules({ ...empty(), cats: [{ ...incomplete, createdAt: ago(2 * DAY) }] })).toEqual([]);
	});

	it('C4 : tous les champs, sauf ceux qui ont leur propre tâche (identification, stérilisation)', () => {
		const bare = cat({
			realName: null,
			hasPhoto: false,
			birthDate: null,
			sex: 'UNKNOWN',
			color: null,
			hairLength: null,
			origin: null,
			description: null,
			vaccinate: null
		});
		const c4 = buildTasks({ ...empty(), cats: [bare] }, NOW).find((t) => t.rule === 'C4');
		expect(c4?.detail).toBe(
			'Il manque : nom, photo, sexe, date de naissance, couleur, poil, origine, description, vaccination'
		);
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
		const cats = statuses.map((status, i) =>
			cat({ id: `c${i}`, status, hasHome: false, isSterilized: false })
		);
		expect(rules({ ...empty(), cats })).toEqual([]);
	});
});

describe('Publication', () => {
	// Un chat prêt : soins à jour, en gestion depuis 30 jours, pas encore sur le site
	const ready = (overrides: Partial<TaskCat> = {}) =>
		cat({ isDewormed: true, isFivTested: true, isVisible: false, ...overrides });

	it('C5 : soins à jour depuis 4 semaines → le proposer ; sinon rien', () => {
		expect(rules({ ...empty(), cats: [ready()] })).toEqual(['C5:WATCH']);
		expect(rules({ ...empty(), cats: [ready({ isFivTested: false })] })).toEqual([]);
		expect(rules({ ...empty(), cats: [ready({ vaccinate: 'PARTIAL' })] })).toEqual([]);
		expect(rules({ ...empty(), cats: [ready({ createdAt: ago(10 * DAY) })] })).toEqual([]);
	});

	it("C5 : un chaton d'au moins 8 semaines", () => {
		expect(rules({ ...empty(), cats: [ready({ birthDate: ago(40 * DAY) })] })).not.toContain(
			'C5:WATCH'
		);
		expect(rules({ ...empty(), cats: [ready({ birthDate: ago(60 * DAY) })] })).toContain(
			'C5:WATCH'
		);
	});

	it("C7 : proposé → à valider par l'admin et la communication (plus de C5)", () => {
		const tasks = buildTasks(
			{ ...empty(), cats: [ready({ publicationRequestedAt: ago(2 * DAY) })] },
			NOW
		);
		expect(tasks.map((t) => t.rule)).toEqual(['C7']);
		expect(tasks[0].audience.kind).toBe('ADMIN_COMMUNICATION');
	});

	it('C5 après un refus : le mot de l’équipe', () => {
		const [task] = buildTasks(
			{ ...empty(), cats: [ready({ publicationRefusalNote: 'Il manque des photos' })] },
			NOW
		);
		expect(task.detail).toBe('Refusée : Il manque des photos');
	});
});

describe('Santé', () => {
	it('V2 : un chaton, 3 semaines avant ses 6 mois ; un adulte non stérilisé, tout de suite', () => {
		const kitten = (days: number) => cat({ isSterilized: false, birthDate: ago(days * DAY) });
		expect(rules({ ...empty(), cats: [kitten(120)] })).toEqual([]);
		expect(rules({ ...empty(), cats: [kitten(165)] })).toEqual(['V2:WEEK']);
		expect(rules({ ...empty(), cats: [kitten(400)] })).toEqual(['V2:WEEK']);
	});

	it('V4 : identification à partir de 6 semaines', () => {
		const young = (days: number) => cat({ isIdentified: false, birthDate: ago(days * DAY) });
		expect(rules({ ...empty(), cats: [young(30)] })).toEqual([]);
		expect(rules({ ...empty(), cats: [young(50)] })).toEqual(['V4:WEEK']);
	});
});

describe('Rappels et FA indisponibles', () => {
	it('V1 : le rappel du dernier vaccin dans moins de 14 jours (ou passé)', () => {
		expect(rules({ ...empty(), cats: [cat({ vaccineDueAt: ago(-10 * DAY) })] })).toEqual([
			'V1:WEEK'
		]);
		expect(rules({ ...empty(), cats: [cat({ vaccineDueAt: ago(2 * DAY) })] })).toEqual(['V1:WEEK']);
		expect(rules({ ...empty(), cats: [cat({ vaccineDueAt: ago(-30 * DAY) })] })).toEqual([]);
	});

	it("F5 : une FA indisponible depuis 3 mois, pour l'admin", () => {
		const hosts = [
			{ id: 'h1', name: 'Ana P.', unavailableSince: ago(100 * DAY) },
			{ id: 'h2', name: 'Eva R.', unavailableSince: ago(30 * DAY) }
		];
		const tasks = buildTasks({ ...empty(), hosts }, NOW);
		expect(tasks.map((t) => t.id)).toEqual(['F5:h1']);
		expect(tasks[0].audience.kind).toBe('ADMIN');
	});

	it('A3 : la demande précise va aussi aux bénévoles du chat ; la libre, à celle qui l’a', () => {
		const specific = form({ assignedToId: null, catVolunteerIds: ['julie', 'paul'] });
		const [task] = buildTasks({ ...empty(), forms: [specific] }, NOW);
		expect(task.audience).toEqual({ kind: 'VOLUNTEERS', ids: ['julie', 'paul'] });
		const flexible = form({ type: 'ADOPTION_FLEXIBLE', catVolunteerIds: ['paul'] });
		const [flex] = buildTasks({ ...empty(), forms: [flexible] }, NOW);
		expect(flex.audience).toEqual({ kind: 'VOLUNTEERS', ids: ['julie'] });
	});
});

describe('Candidatures', () => {
	const hostForm = (assignedToId: string | null) =>
		form({ id: 'h', type: 'HOST', assignedToId, personName: 'Ana P.', catName: null });

	it("F4 : personne n'en est chargée → l'admin la confie", () => {
		const [task] = buildTasks({ ...empty(), forms: [hostForm(null)] }, NOW);
		expect(task.rule).toBe('F4');
		expect(task.audience.kind).toBe('ADMIN');
	});

	it('F1 : la bénévole en charge étudie la candidature FA', () => {
		const [task] = buildTasks({ ...empty(), forms: [hostForm('julie')] }, NOW);
		expect(task.rule).toBe('F1');
		expect(task.audience).toEqual({ kind: 'VOLUNTEERS', ids: ['julie'] });
	});

	it('B1 : la candidature bénévole va aux admins qui la suivent', () => {
		const followed = form({ type: 'VOLUNTEER', assigneeIds: ['admin-1', 'admin-2'] });
		const [task] = buildTasks({ ...empty(), forms: [followed] }, NOW);
		expect(task.audience).toEqual({ kind: 'ADMIN', ids: ['admin-1', 'admin-2'] });
		expect(adminTasks([task], 'admin-1')).toHaveLength(1);
		expect(adminTasks([task], 'admin-3')).toHaveLength(0);
	});

	it("B1 : la candidature bénévole est pour l'admin", () => {
		const [task] = buildTasks({ ...empty(), forms: [form({ type: 'VOLUNTEER' })] }, NOW);
		expect(task.rule).toBe('B1');
		expect(task.audience.kind).toBe('ADMIN');
	});

	it('F2 : contrat FA à relancer 7 jours avant expiration ; B2 : invitation bénévole expirée', () => {
		const invitations = [
			{ id: 'h1', kind: 'HOST' as const, name: 'Ana P.', expiresAt: ago(-5 * DAY) },
			{ id: 'h2', kind: 'HOST' as const, name: 'Eva R.', expiresAt: ago(-10 * DAY) },
			{ id: 'v1', kind: 'VOLUNTEER' as const, name: 'Léo M.', expiresAt: ago(-DAY) },
			{ id: 'v2', kind: 'VOLUNTEER' as const, name: 'Zoé T.', expiresAt: ago(DAY) }
		];
		const ids = buildTasks({ ...empty(), invitations }, NOW).map((t) => t.id);
		expect(ids.sort()).toEqual(['B2:v2', 'F2:h1']);
	});

	it('B3 : plus de 20 tâches urgentes pour une bénévole', () => {
		const forms = Array.from({ length: 21 }, (_, i) =>
			form({ id: `f-${i}`, createdAt: ago(10 * DAY) })
		);
		const volunteers = [{ id: 'julie', name: 'Julie Martin' }];
		const tasks = buildTasks({ ...empty(), forms, volunteers }, NOW);
		expect(tasks.filter((t) => t.rule === 'B3')).toHaveLength(1);
		expect(rules({ ...empty(), forms: forms.slice(1), volunteers })).not.toContain('B3:WEEK');
	});
});

describe('qui voit quoi', () => {
	const sources: TaskSources = {
		...empty(),
		sos: [sos({ id: 's' })],
		adoptions: [{ catId: 'a', catName: 'A', trialEndsAt: ago(DAY), volunteerIds: ['julie'] }],
		cats: [
			cat({ id: 'b', hasHome: false }),
			cat({ id: 'c', isVisible: true, publishedAt: ago(60 * DAY) })
		]
	};
	const tasks = buildTasks(sources, NOW);
	const ids = (list: { rule: string }[]) => list.map((t) => t.rule).sort();

	it("une bénévole : ses tâches et celles de l'asso", () => {
		expect(ids(volunteerTasks(tasks, { id: 'julie', role: 'MANAGER' }))).toEqual(['A1', 'S1']);
		expect(ids(volunteerTasks(tasks, { id: 'paul', role: 'MANAGER' }))).toEqual(['S1']);
	});

	it('une bénévole communication voit aussi « Mettre en avant »', () => {
		expect(ids(volunteerTasks(tasks, { id: 'paul', role: 'COMMUNICATION' }))).toEqual(['C6', 'S1']);
	});

	it("les actions d'administration : tout ce qui n'est pas à une bénévole", () => {
		expect(ids(adminTasks(tasks))).toEqual(['C1', 'C6', 'S1']);
	});

	it("les tâches d'une bénévole, et seulement les siennes", () => {
		expect(ids(tasksOf(tasks, 'julie'))).toEqual(['A1']);
		expect(tasksOf(tasks, 'paul')).toEqual([]);
	});
});
