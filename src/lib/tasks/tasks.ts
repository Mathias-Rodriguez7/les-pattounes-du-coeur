import type {
	CatStatus,
	FormType,
	HairLength,
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
	/** Demande précise : les bénévoles du chat (elles s'en occupent aussi) */
	catVolunteerIds: string[];
};

export type TaskCat = {
	id: string;
	name: string;
	status: CatStatus;
	createdAt: Date;
	isVisible: boolean;
	publishedAt: Date | null;
	/** Le vrai nom (null si le chat n'en a pas encore) ; `name` sert à l'affichage */
	realName: string | null;
	hasPhoto: boolean;
	birthDate: Date | null;
	sex: SexCat;
	color: string | null;
	hairLength: HairLength | null;
	origin: string | null;
	description: string | null;
	vaccinate: Vaccinate | null;
	/** Stérilisé (par l'asso, ou déjà stérilisé à son arrivée) */
	isSterilized: boolean;
	isIdentified: boolean;
	/** Le dernier vaccin : sa date de rappel, si elle a été notée */
	vaccineDueAt: Date | null;
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

/** Une FA active qui s'est déclarée indisponible */
export type TaskHost = {
	id: string;
	name: string;
	unavailableSince: Date;
};

export type TaskSources = {
	sos: TaskSos[];
	hosts?: TaskHost[];
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
				urgency: 'WEEK',
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
		// A3 : une demande d'adoption encore en attente. La demande libre : la bénévole qui l'a ;
		// la demande précise : elle, et les bénévoles du chat
		const answerers = [
			...new Set([
				...(form.type === 'ADOPTION_SPECIFIC' ? form.catVolunteerIds : []),
				...(form.assignedToId ? [form.assignedToId] : [])
			])
		];
		if (isAdoption && answerers.length > 0) {
			tasks.push({
				id: `A3:${form.id}`,
				rule: 'A3',
				title: `Répondre à la demande d'adoption de ${form.personName}`,
				detail: form.catName ? `Pour ${form.catName} · ${received}` : `Demande libre · ${received}`,
				short: form.catName ? `${form.personName} · ${form.catName}` : form.personName,
				badge: formatShort(waited),
				urgency: waited >= TASK_DELAYS.adoptionRequestUrgent ? 'URGENT' : 'WEEK',
				audience: { kind: 'VOLUNTEERS', ids: answerers },
				link: { kind: 'form', id: form.id, allForms: false },
				action: 'Répondre',
				since: form.createdAt
			});
		}
		// F4 : une candidature FA que personne n'a en charge : l'admin la confie à une bénévole
		if (form.type === 'HOST' && !form.assignedToId) {
			tasks.push({
				id: `F4:${form.id}`,
				rule: 'F4',
				title: `Confier la candidature FA de ${form.personName} à une bénévole`,
				detail: `Candidature ${received}, personne n'en est chargée`,
				short: form.personName,
				badge: formatShort(waited),
				urgency: 'WEEK',
				audience: { kind: 'ADMIN' },
				link: { kind: 'form', id: form.id, allForms: true },
				action: 'Confier',
				since: form.createdAt
			});
		}
		// F1 : la bénévole en charge étudie la candidature FA ; B1 : l'admin, la candidature bénévole
		const studied =
			form.type === 'HOST' && form.assignedToId
				? {
						rule: 'F1' as const,
						what: 'FA',
						audience: { kind: 'VOLUNTEERS' as const, ids: [form.assignedToId] }
					}
				: form.type === 'VOLUNTEER'
					? { rule: 'B1' as const, what: 'bénévole', audience: { kind: 'ADMIN' as const } }
					: null;
		if (studied) {
			tasks.push({
				id: `${studied.rule}:${form.id}`,
				rule: studied.rule,
				title: `Étudier la candidature ${studied.what} de ${form.personName}`,
				detail: `Candidature ${received}`,
				short: form.personName,
				badge: formatShort(waited),
				urgency: waited >= TASK_DELAYS.applicationUrgent ? 'URGENT' : 'WEEK',
				audience: studied.audience,
				link: { kind: 'form', id: form.id, allForms: studied.rule === 'B1' },
				action: 'Étudier',
				since: form.createdAt
			});
		}
	}
	return tasks;
}

/** C4 : les champs manquants d'une fiche (« sexe, origine ») */
export function missingProfileFields(cat: TaskCat): string[] {
	const checks: [boolean, string][] = [
		[!cat.realName?.trim(), PROFILE_REQUIRED_FIELDS.name],
		[!cat.hasPhoto, PROFILE_REQUIRED_FIELDS.photo],
		[cat.sex === 'UNKNOWN', PROFILE_REQUIRED_FIELDS.sex],
		[!cat.birthDate, PROFILE_REQUIRED_FIELDS.birthDate],
		[!cat.color?.trim(), PROFILE_REQUIRED_FIELDS.color],
		[!cat.hairLength, PROFILE_REQUIRED_FIELDS.hairLength],
		[!cat.origin?.trim(), PROFILE_REQUIRED_FIELDS.origin],
		[!cat.description?.trim(), PROFILE_REQUIRED_FIELDS.description],
		[!cat.vaccinate, PROFILE_REQUIRED_FIELDS.vaccinate]
	];
	return checks.filter(([isMissing]) => isMissing).map(([, label]) => label);
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
				title: `Relancer ou annuler les FA contactées pour ${cat.name}`,
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

		// V1 : le rappel du dernier vaccin approche (ou est dépassé)
		if (cat.vaccineDueAt) {
			const left = cat.vaccineDueAt.getTime() - now.getTime();
			if (left <= TASK_DELAYS.vaccineNotice) {
				tasks.push({
					id: `V1:${cat.id}`,
					rule: 'V1',
					title: `Faire le rappel de vaccin de ${cat.name}`,
					detail:
						left < 0
							? `Rappel prévu le ${formatDay(cat.vaccineDueAt)}, déjà passé`
							: `Rappel prévu le ${formatDay(cat.vaccineDueAt)}`,
					short: cat.name,
					badge: formatDay(cat.vaccineDueAt),
					urgency: 'WEEK',
					audience: catAudience(cat.volunteerIds),
					link,
					action: 'Ouvrir',
					since: cat.vaccineDueAt
				});
			}
		}

		// L'âge du chat (null : date de naissance inconnue)
		const born = cat.birthDate ? now.getTime() - cat.birthDate.getTime() : null;

		// V2 : stérilisation. Un chaton : 3 semaines avant ses 6 mois ; un adulte (ou un âge
		// inconnu) : tout de suite
		const sterilizeFrom = TASK_DELAYS.sterilizationAge - TASK_DELAYS.sterilizationNotice;
		if (!cat.isSterilized && (born === null || born >= sterilizeFrom)) {
			const dueAt =
				cat.birthDate && born! < TASK_DELAYS.sterilizationAge
					? new Date(cat.birthDate.getTime() + TASK_DELAYS.sterilizationAge)
					: null;
			tasks.push({
				id: `V2:${cat.id}`,
				rule: 'V2',
				title: `Prévoir la stérilisation de ${cat.name}`,
				detail: dueAt ? `Aura 6 mois le ${formatDay(dueAt)}` : 'Pas encore stérilisé',
				short: cat.name,
				badge: dueAt ? formatDay(dueAt) : null,
				urgency: 'WEEK',
				audience: catAudience(cat.volunteerIds),
				link,
				action: 'Ouvrir',
				since: dueAt ?? cat.createdAt
			});
		}

		// V4 : identification, à partir de 6 semaines (ou âge inconnu)
		if (!cat.isIdentified && (born === null || born >= TASK_DELAYS.identificationAge)) {
			tasks.push({
				id: `V4:${cat.id}`,
				rule: 'V4',
				title: `Faire identifier ${cat.name}`,
				detail: 'Pas encore pucé ni tatoué',
				short: cat.name,
				badge: null,
				urgency: 'WEEK',
				audience: catAudience(cat.volunteerIds),
				link,
				action: 'Ouvrir',
				since: cat.createdAt
			});
		}
	}
	return tasks;
}

function invitationTasks(list: TaskInvitation[], now: Date): Task[] {
	return list
		.filter((invitation) =>
			// F2 : un contrat FA se relance AVANT que le lien expire ; B2 : à l'expiration
			invitation.kind === 'HOST'
				? invitation.expiresAt.getTime() - now.getTime() <= TASK_DELAYS.hostInvitationReminder
				: invitation.expiresAt <= now
		)
		.map((invitation) => {
			const isHost = invitation.kind === 'HOST';
			const expired = invitation.expiresAt <= now;
			return {
				id: `${isHost ? 'F2' : 'B2'}:${invitation.id}`,
				rule: isHost ? 'F2' : 'B2',
				title: isHost
					? `Relancer la signature du contrat de ${invitation.name}`
					: `Relancer l'invitation de ${invitation.name}`,
				detail: expired
					? `Lien expiré le ${formatDay(invitation.expiresAt)}, inscription jamais faite`
					: `Le lien expire le ${formatDay(invitation.expiresAt)}, contrat pas encore signé`,
				short: invitation.name,
				badge: formatDay(invitation.expiresAt),
				urgency: 'WATCH',
				audience: { kind: 'ADMIN' },
				link: { kind: isHost ? 'host' : 'volunteer', id: invitation.id },
				action: 'Relancer',
				since: invitation.expiresAt
			} satisfies Task;
		});
}

/** F5 : une FA indisponible depuis longtemps : lui demander si elle l'est de nouveau */
function hostTasks(list: TaskHost[], now: Date): Task[] {
	return list
		.filter(
			(host) => now.getTime() - host.unavailableSince.getTime() >= TASK_DELAYS.hostUnavailable
		)
		.map((host) => ({
			id: `F5:${host.id}`,
			rule: 'F5',
			title: `Demander à ${host.name} si elle est de nouveau disponible`,
			detail: `Indisponible depuis le ${formatDay(host.unavailableSince)}`,
			short: host.name,
			badge: formatShort(now.getTime() - host.unavailableSince.getTime()),
			urgency: 'WATCH',
			audience: { kind: 'ADMIN' },
			link: { kind: 'host', id: host.id },
			action: 'Ouvrir',
			since: host.unavailableSince
		}));
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

/** TOUTES les tâches de l'asso. Qui voit quoi : adminTasks, volunteerTasks, tasksOf */
export function buildTasks(sources: TaskSources, now: Date): Task[] {
	const tasks = [
		...sosTasks(sources.sos, now),
		...adoptionTasks(sources.adoptions, now),
		...formTasks(sources.forms, now),
		...catTasks(sources.cats, now),
		...invitationTasks(sources.invitations, now),
		...hostTasks(sources.hosts ?? [], now)
	];
	return [...tasks, ...overloadTasks(tasks, sources.volunteers)];
}

// ---------- Qui voit quoi ----------

export type TaskViewer = { id: string; role: VolunteerRole };

const concerns = (task: Task, volunteerId: string) =>
	task.audience.kind === 'VOLUNTEERS' && task.audience.ids.includes(volunteerId);

/** Les actions d'administration : tout ce qui n'est pas à une bénévole précise */
export function adminTasks(tasks: Task[]) {
	return tasks.filter((task) => task.audience.kind !== 'VOLUNTEERS');
}

/**
 * Le dashboard d'une bénévole (et la vue « Bénévole » de l'admin) : ses tâches, celles de
 * l'asso (un SOS à prendre), et pour une bénévole COMMUNICATION, « Mettre en avant ».
 */
export function volunteerTasks(tasks: Task[], viewer: TaskViewer) {
	return tasks.filter(
		(task) =>
			concerns(task, viewer.id) ||
			task.audience.kind === 'ASSO' ||
			(task.audience.kind === 'ADMIN_COMMUNICATION' && viewer.role === 'COMMUNICATION')
	);
}

/** Les tâches d'une bénévole, et seulement les siennes (le panneau de la page Bénévoles) */
export function tasksOf(tasks: Task[], volunteerId: string) {
	return tasks.filter((task) => concerns(task, volunteerId));
}
