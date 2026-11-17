import type {
	CatStatus,
	FormType,
	InvitationKind,
	SexCat,
	SosStatus,
	Vaccinate,
	VolunteerRole
} from '@prisma/client';
import {
	PROFILE_REQUIRED_FIELDS,
	TASK_DELAYS,
	TASK_OVERLOAD_THRESHOLD,
	TASK_URGENCY_ORDER,
	type TaskRule,
	type TaskUrgency
} from '#lib/constants/tasks.ts';

// =====================================================================
// Les tâches : calculées à partir des données, sans rien stocker.
// Une tâche faite disparaît d'elle-même (la condition n'est plus vraie).
// Ce fichier est PUR (pas de base, pas de date « maintenant » cachée) : on le teste facilement.
// La lecture en base est dans server/tasks.ts.
// =====================================================================

/** Qui doit voir la tâche */
export type TaskAudience =
	| { kind: 'VOLUNTEERS'; ids: string[] } // les bénévoles concernées (le chat, le SOS, la demande)
	| { kind: 'ASSO' } // toutes : la première qui la prend
	| { kind: 'ADMIN' }
	| { kind: 'ADMIN_COMMUNICATION' };

/** Où mène le bouton de la tâche : une fiche, panneau ouvert (?id=…) */
export type TaskLink =
	| { kind: 'cat' | 'sos' | 'volunteer' | 'host'; id: string }
	| { kind: 'form'; id: string; allForms: boolean };

export type Task = {
	/** Unique : la règle + l'élément concerné */
	id: string;
	rule: TaskRule;
	title: string;
	/** Pourquoi maintenant : « Essai terminé depuis 3 jours » */
	detail: string;
	/** En liste courte (tableau « À traiter ») : « Saint-Jean-de-Védas · 14/11 », « Astarté D. » */
	short: string;
	/** La pastille : depuis combien de temps (« 3 j », « 7 h »), une date, ou rien */
	badge: string | null;
	urgency: TaskUrgency;
	audience: TaskAudience;
	link: TaskLink;
	/** Le texte du bouton */
	action: string;
	/** Depuis quand la situation dure (pour trier : la plus ancienne d'abord) */
	since: Date;
};

// ---------- Les données lues en base (server/tasks.ts) ----------

export type TaskSos = {
	id: string;
	reportedAt: Date;
	updatedAt: Date;
	status: SosStatus;
	handledById: string | null;
	city: string | null;
	catCount: number;
};

export type TaskAdoption = {
	catId: string;
	catName: string;
	trialEndsAt: Date;
	volunteerIds: string[];
};

export type TaskForm = {
	id: string;
	type: FormType;
	createdAt: Date;
	assignedToId: string | null;
	personName: string;
	catName: string | null;
};

export type TaskCat = {
	id: string;
	name: string;
	status: CatStatus;
	createdAt: Date;
	isVisible: boolean;
	publishedAt: Date | null;
	sex: SexCat;
	origin: string | null;
	description: string | null;
	vaccinate: Vaccinate | null;
	volunteerIds: string[];
	/** Dans une FA en ce moment (placement long, court ou transfert actif) */
	hasHome: boolean;
	/** Les propositions à des FA en cours : leur date */
	openProposals: Date[];
	/** Des demandes d'adoption en attente pour ce chat */
	pendingRequests: number;
};

export type TaskInvitation = {
	id: string;
	kind: InvitationKind;
	name: string;
	expiresAt: Date;
};

export type TaskSources = {
	sos: TaskSos[];
	adoptions: TaskAdoption[];
	forms: TaskForm[];
	cats: TaskCat[];
	invitations: TaskInvitation[];
	volunteers: { id: string; name: string }[];
};

// ---------- Petits outils ----------

const DAY = 24 * 60 * 60 * 1000;

/** « 3 jours », « 1 jour », « 26 h » (moins de 2 jours : en heures) */
export function formatDuration(ms: number): string {
	const hours = Math.max(0, Math.floor(ms / (60 * 60 * 1000)));
	if (hours < 48) return `${hours} h`;
	const days = Math.floor(ms / DAY);
	return `${days} jour${days > 1 ? 's' : ''}`;
}

/** La version courte, pour une pastille : « 7 h », « 3 j » */
export function formatShort(ms: number): string {
	const hours = Math.max(0, Math.floor(ms / (60 * 60 * 1000)));
	return hours < 48 ? `${hours} h` : `${Math.floor(ms / DAY)} j`;
}

const formatDay = (date: Date) =>
	date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' });

/** Une tâche de chat : aux bénévoles du chat, ou à l'admin s'il n'en a pas */
const catAudience = (volunteerIds: string[]): TaskAudience =>
	volunteerIds.length > 0 ? { kind: 'VOLUNTEERS', ids: volunteerIds } : { kind: 'ADMIN' };

/** Le chat est-il géré par l'asso et pas encore adopté ? */
const isInCare = (status: CatStatus) => status === 'AVAILABLE' || status === 'SOCIALIZE';

// ---------- Les règles ----------

function sosTasks(list: TaskSos[], now: Date): Task[] {
	const tasks: Task[] = [];
	for (const sos of list) {
		const where = sos.city ? ` · ${sos.city}` : '';
		const waited = now.getTime() - sos.reportedAt.getTime();
		// S1 : personne ne l'a pris
		if (sos.status === 'NEW' && !sos.handledById) {
			tasks.push({
				id: `S1:${sos.id}`,
				rule: 'S1',
				title: `Prendre en charge le SOS du ${formatDay(sos.reportedAt)}`,
				detail: `Personne ne l'a pris depuis ${formatDuration(waited)}${where}`,
				short: `${sos.city ?? 'Lieu inconnu'} · ${formatDay(sos.reportedAt)}`,
				badge: formatShort(waited),
				urgency: waited >= TASK_DELAYS.sosUntakenUrgent ? 'URGENT' : 'WEEK',
				audience: { kind: 'ASSO' },
				link: { kind: 'sos', id: sos.id },
				action: 'Voir le SOS',
				since: sos.reportedAt
			});
		}
		// S2 : en cours, sans chat et sans changement depuis longtemps
		const quiet = now.getTime() - sos.updatedAt.getTime();
		if (
			sos.status === 'IN_PROGRESS' &&
			sos.handledById &&
			sos.catCount === 0 &&
			quiet >= TASK_DELAYS.sosStale
		) {
			tasks.push({
				id: `S2:${sos.id}`,
				rule: 'S2',
				title: `Faire le point sur le SOS du ${formatDay(sos.reportedAt)}`,
				detail: `En cours depuis ${formatDuration(quiet)} sans changement, aucun chat associé${where}`,
				short: `${sos.city ?? 'Lieu inconnu'} · ${formatDay(sos.reportedAt)}`,
				badge: formatShort(quiet),
				urgency: 'WEEK',
				audience: { kind: 'VOLUNTEERS', ids: [sos.handledById] },
				link: { kind: 'sos', id: sos.id },
				action: 'Ouvrir',
				since: sos.updatedAt
			});
		}
	}
	return tasks;
}

function adoptionTasks(list: TaskAdoption[], now: Date): Task[] {
	const tasks: Task[] = [];
	for (const adoption of list) {
		const left = adoption.trialEndsAt.getTime() - now.getTime();
		if (left <= 0) {
			// A1 : l'essai est fini
			tasks.push({
				id: `A1:${adoption.catId}`,
				rule: 'A1',
				title: `Finaliser l'adoption de ${adoption.catName}`,
				detail: `Essai terminé depuis ${formatDuration(-left)}`,
				short: adoption.catName,
				badge: formatShort(-left),
				urgency: 'URGENT',
				audience: catAudience(adoption.volunteerIds),
				link: { kind: 'cat', id: adoption.catId },
				action: 'Finaliser',
				since: adoption.trialEndsAt
			});
		} else if (left <= TASK_DELAYS.trialEndingSoon) {
			// A2 : il finit bientôt
			tasks.push({
				id: `A2:${adoption.catId}`,
				rule: 'A2',
				title: `Préparer la fin d'essai de ${adoption.catName}`,
				detail: `Fin de l'essai le ${formatDay(adoption.trialEndsAt)}`,
				short: adoption.catName,
				badge: formatDay(adoption.trialEndsAt),
				urgency: 'WATCH',
				audience: catAudience(adoption.volunteerIds),
				link: { kind: 'cat', id: adoption.catId },
				action: 'Ouvrir',
				since: adoption.trialEndsAt
			});
		}
	}
	return tasks;
}

function formTasks(list: TaskForm[], now: Date): Task[] {
	const tasks: Task[] = [];
	for (const form of list) {
		const waited = now.getTime() - form.createdAt.getTime();
		const received = `reçue il y a ${formatDuration(waited)}`;
		const isAdoption = form.type === 'ADOPTION_SPECIFIC' || form.type === 'ADOPTION_FLEXIBLE';
		// A3 : une demande d'adoption assignée, toujours en attente
		if (isAdoption && form.assignedToId) {
			tasks.push({
				id: `A3:${form.id}`,
				rule: 'A3',
				title: `Répondre à la demande d'adoption de ${form.personName}`,
				detail: form.catName ? `Pour ${form.catName} · ${received}` : `Demande libre · ${received}`,
				short: form.catName ? `${form.personName} · ${form.catName}` : form.personName,
				badge: formatShort(waited),
				urgency: waited >= TASK_DELAYS.adoptionRequestUrgent ? 'URGENT' : 'WEEK',
				audience: { kind: 'VOLUNTEERS', ids: [form.assignedToId] },
				link: { kind: 'form', id: form.id, allForms: false },
				action: 'Répondre',
				since: form.createdAt
			});
		}
		// F1, B1 : une candidature FA ou bénévole à étudier
		if (form.type === 'HOST' || form.type === 'VOLUNTEER') {
			const isHost = form.type === 'HOST';
			tasks.push({
				id: `${isHost ? 'F1' : 'B1'}:${form.id}`,
				rule: isHost ? 'F1' : 'B1',
				title: `Étudier la candidature ${isHost ? 'FA' : 'bénévole'} de ${form.personName}`,
				detail: `Candidature ${received}`,
				short: form.personName,
				badge: formatShort(waited),
				urgency: waited >= TASK_DELAYS.applicationUrgent ? 'URGENT' : 'WEEK',
				audience: { kind: 'ADMIN' },
				link: { kind: 'form', id: form.id, allForms: true },
				action: 'Étudier',
				since: form.createdAt
			});
		}
	}
	return tasks;
}

/** C4 : les champs manquants d'une fiche (« sexe, origine ») */
export function missingProfileFields(cat: TaskCat): string[] {
	const missing: string[] = [];
	if (cat.sex === 'UNKNOWN') missing.push(PROFILE_REQUIRED_FIELDS.sex);
	if (!cat.origin?.trim()) missing.push(PROFILE_REQUIRED_FIELDS.origin);
	if (!cat.description?.trim()) missing.push(PROFILE_REQUIRED_FIELDS.description);
	if (!cat.vaccinate) missing.push(PROFILE_REQUIRED_FIELDS.vaccinate);
	return missing;
}

function catTasks(list: TaskCat[], now: Date): Task[] {
	const tasks: Task[] = [];
	for (const cat of list) {
		if (!isInCare(cat.status)) continue;
		const link: TaskLink = { kind: 'cat', id: cat.id };
		const age = now.getTime() - cat.createdAt.getTime();

		// C1 : pas de famille d'accueil (l'admin place les chats)
		if (!cat.hasHome) {
			tasks.push({
				id: `C1:${cat.id}`,
				rule: 'C1',
				title: `Trouver une famille d'accueil pour ${cat.name}`,
				detail:
					cat.openProposals.length > 0
						? `Sans FA · ${cat.openProposals.length} proposition${cat.openProposals.length > 1 ? 's' : ''} en cours`
						: 'Sans FA, aucune proposition en cours',
				short: cat.name,
				badge: null,
				urgency: 'URGENT',
				audience: { kind: 'ADMIN' },
				link,
				action: 'Voir les FA',
				since: cat.createdAt
			});
		}

		// C2 : des FA ont reçu une proposition, sans répondre
		const oldest = cat.openProposals.reduce<Date | null>(
			(min, date) => (!min || date < min ? date : min),
			null
		);
		if (oldest && now.getTime() - oldest.getTime() >= TASK_DELAYS.proposalNoAnswer) {
			const count = cat.openProposals.length;
			tasks.push({
				id: `C2:${cat.id}`,
				rule: 'C2',
				title: `Relancer les FA contactées pour ${cat.name}`,
				detail: `${count} FA sans réponse depuis ${formatDuration(now.getTime() - oldest.getTime())}`,
				short: `${cat.name} · ${count} FA`,
				badge: formatShort(now.getTime() - oldest.getTime()),
				urgency: 'WATCH',
				audience: { kind: 'ADMIN' },
				link,
				action: 'Ouvrir',
				since: oldest
			});
		}

		// C3 : personne ne suit ce chat
		if (cat.volunteerIds.length === 0) {
			tasks.push({
				id: `C3:${cat.id}`,
				rule: 'C3',
				title: `Associer une bénévole à ${cat.name}`,
				detail: 'Aucune bénévole ne suit ce chat',
				short: cat.name,
				badge: null,
				urgency: 'WEEK',
				audience: { kind: 'ADMIN' },
				link,
				action: 'Associer',
				since: cat.createdAt
			});
		}

		// C4 : fiche incomplète, quelques jours après la création
		const missing = missingProfileFields(cat);
		if (missing.length > 0 && age >= TASK_DELAYS.incompleteProfile) {
			tasks.push({
				id: `C4:${cat.id}`,
				rule: 'C4',
				title: `Compléter la fiche de ${cat.name}`,
				detail: `Il manque : ${missing.join(', ')}`,
				short: `${cat.name} · ${missing.join(', ')}`,
				badge: null,
				urgency: 'WATCH',
				audience: catAudience(cat.volunteerIds),
				link,
				action: 'Compléter',
				since: cat.createdAt
			});
		}

		// C6 : visible depuis longtemps, et personne ne l'a demandé
		const visibleFor = cat.publishedAt ? now.getTime() - cat.publishedAt.getTime() : 0;
		if (
			cat.status === 'AVAILABLE' &&
			cat.isVisible &&
			cat.publishedAt &&
			cat.pendingRequests === 0 &&
			visibleFor >= TASK_DELAYS.visibleWithoutRequest
		) {
			tasks.push({
				id: `C6:${cat.id}`,
				rule: 'C6',
				title: `Mettre en avant ${cat.name}`,
				detail: `Visible depuis ${formatDuration(visibleFor)}, aucune demande d'adoption`,
				short: cat.name,
				badge: formatShort(visibleFor),
				urgency: 'WATCH',
				audience: { kind: 'ADMIN_COMMUNICATION' },
				link,
				action: 'Ouvrir',
				since: cat.publishedAt
			});
		}
	}
	return tasks;
}

function invitationTasks(list: TaskInvitation[], now: Date): Task[] {
	return list
		.filter((invitation) => invitation.expiresAt <= now)
		.map((invitation) => {
			const isHost = invitation.kind === 'HOST';
			return {
				id: `${isHost ? 'F2' : 'B2'}:${invitation.id}`,
				rule: isHost ? 'F2' : 'B2',
				title: `Relancer l'invitation de ${invitation.name}`,
				detail: `Lien expiré le ${formatDay(invitation.expiresAt)}, inscription jamais faite`,
				short: `${invitation.name} · ${isHost ? 'FA' : 'bénévole'}`,
				badge: formatDay(invitation.expiresAt),
				urgency: 'WATCH',
				audience: { kind: 'ADMIN' },
				link: { kind: isHost ? 'host' : 'volunteer', id: invitation.id },
				action: 'Relancer',
				since: invitation.expiresAt
			} satisfies Task;
		});
}

/** B3 : les bénévoles qui ont trop de tâches urgentes */
function overloadTasks(tasks: Task[], volunteers: TaskSources['volunteers']): Task[] {
	const urgentCount = new Map<string, number>();
	for (const task of tasks) {
		if (task.urgency !== 'URGENT' || task.audience.kind !== 'VOLUNTEERS') continue;
		for (const id of task.audience.ids) urgentCount.set(id, (urgentCount.get(id) ?? 0) + 1);
	}
	return volunteers
		.filter((volunteer) => (urgentCount.get(volunteer.id) ?? 0) > TASK_OVERLOAD_THRESHOLD)
		.map((volunteer) => ({
			id: `B3:${volunteer.id}`,
			rule: 'B3',
			title: `Répartir les tâches de ${volunteer.name}`,
			detail: `${urgentCount.get(volunteer.id)} tâches urgentes`,
			short: volunteer.name,
			badge: String(urgentCount.get(volunteer.id)),
			urgency: 'WEEK',
			audience: { kind: 'ADMIN' },
			link: { kind: 'volunteer', id: volunteer.id },
			action: 'Voir',
			since: new Date(0)
		}));
}

/** TOUTES les tâches de l'asso. Qui voit quoi : visibleTasks */
export function buildTasks(sources: TaskSources, now: Date): Task[] {
	const tasks = [
		...sosTasks(sources.sos, now),
		...adoptionTasks(sources.adoptions, now),
		...formTasks(sources.forms, now),
		...catTasks(sources.cats, now),
		...invitationTasks(sources.invitations, now)
	];
	return [...tasks, ...overloadTasks(tasks, sources.volunteers)];
}

// ---------- Qui voit quoi ----------

export type TaskViewer = { id: string; role: VolunteerRole };

/** La vue de l'admin : ses tâches (+ asso + admin), toutes, ou celles d'une bénévole */
export type TaskFocus = { kind: 'MINE' } | { kind: 'ALL' } | { kind: 'VOLUNTEER'; id: string };

const concerns = (task: Task, volunteerId: string) =>
	task.audience.kind === 'VOLUNTEERS' && task.audience.ids.includes(volunteerId);

/**
 * Une bénévole : ses tâches, celles de l'asso, et (COMMUNICATION) les siennes de rôle.
 * L'admin : par défaut ses tâches + celles de l'asso + celles de l'admin ;
 * « Toutes » ; ou les tâches d'une bénévole (pour l'aider, ou répartir).
 */
export function visibleTasks(
	tasks: Task[],
	viewer: TaskViewer,
	focus: TaskFocus = { kind: 'MINE' }
) {
	if (viewer.role === 'ADMIN') {
		if (focus.kind === 'ALL') return tasks;
		if (focus.kind === 'VOLUNTEER') return tasks.filter((task) => concerns(task, focus.id));
		return tasks.filter((task) => task.audience.kind !== 'VOLUNTEERS' || concerns(task, viewer.id));
	}
	return tasks.filter(
		(task) =>
			concerns(task, viewer.id) ||
			task.audience.kind === 'ASSO' ||
			(task.audience.kind === 'ADMIN_COMMUNICATION' && viewer.role === 'COMMUNICATION')
	);
}

/** Groupées par urgence (urgent d'abord), la situation la plus ancienne en premier */
export function groupByUrgency(tasks: Task[]) {
	return TASK_URGENCY_ORDER.map((urgency) => ({
		urgency,
		tasks: tasks
			.filter((task) => task.urgency === urgency)
			.sort((a, b) => a.since.getTime() - b.since.getTime())
	})).filter((group) => group.tasks.length > 0);
}
