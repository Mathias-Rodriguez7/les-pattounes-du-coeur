// =====================================================================
// Les tâches des bénévoles : les règles validées dans « Tâches des bénévoles ».
// Les délais sont ICI, et nulle part ailleurs : quand les clientes changent un délai,
// on ne touche qu'à ce fichier.
// =====================================================================

/** Le niveau d'urgence d'une tâche, du plus pressé au moins pressé */
export type TaskUrgency = 'URGENT' | 'WEEK' | 'WATCH';

export const TASK_URGENCY_ORDER: TaskUrgency[] = ['URGENT', 'WEEK', 'WATCH'];

export const TASK_URGENCY = {
	URGENT: {
		label: 'Urgent',
		color: 'bg-red-100 text-red-800',
		text: 'text-red-700',
		dot: 'bg-red-500'
	},
	WEEK: {
		label: 'Cette semaine',
		color: 'bg-amber-100 text-amber-800',
		text: 'text-amber-700',
		dot: 'bg-amber-500'
	},
	WATCH: {
		label: 'À surveiller',
		color: 'bg-slate-100 text-slate-700',
		text: 'text-slate-600',
		dot: 'bg-slate-400'
	}
} satisfies Record<TaskUrgency, { label: string; color: string; text: string; dot: string }>;

/** Les règles gardées pour la 1re version (les codes sont ceux du tableau des clientes) */
export type TaskRule =
	| 'S1' // SOS à prendre en charge
	| 'S2' // SOS en cours sans nouvelles
	| 'A1' // adoption à finaliser
	| 'A2' // fin d'essai bientôt
	| 'A3' // demande d'adoption assignée, en attente
	| 'C1' // chat sans famille d'accueil
	| 'C2' // proposition à des FA sans réponse
	| 'C3' // chat sans bénévole
	| 'C4' // fiche incomplète
	| 'C6' // chat adoptable sans demande
	| 'F1' // candidature FA à étudier
	| 'F2' // invitation FA expirée
	| 'B1' // candidature bénévole à étudier
	| 'B2' // invitation bénévole expirée
	| 'B3'; // bénévole surchargée

/** L'étiquette courte de chaque tâche (pastille dans la liste) */
export const TASK_TAG = {
	S1: 'SOS',
	S2: 'SOS',
	A1: 'Adoption',
	A2: 'Adoption',
	A3: 'Demande',
	C1: 'Chat',
	C2: 'Chat',
	C3: 'Chat',
	C4: 'Fiche',
	C6: 'Chat',
	F1: 'FA',
	F2: 'FA',
	B1: 'Bénévole',
	B2: 'Bénévole',
	B3: 'Bénévole'
} satisfies Record<TaskRule, string>;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Les délais (en millisecondes) */
export const TASK_DELAYS = {
	/** S1 : un SOS que personne n'a pris devient urgent */
	sosUntakenUrgent: 24 * HOUR,
	/** S2 : un SOS en cours sans chat ni changement */
	sosStale: 7 * DAY,
	/** A2 : on prévient avant la fin de l'essai */
	trialEndingSoon: 7 * DAY,
	/** A3 : une demande assignée encore en attente devient urgente */
	adoptionRequestUrgent: 5 * DAY,
	/** C2 : une proposition à des FA sans réponse */
	proposalNoAnswer: 3 * DAY,
	/** C4 : une fiche incomplète (après la création du chat) */
	incompleteProfile: 7 * DAY,
	/** C6 : visible depuis longtemps, sans demande d'adoption */
	visibleWithoutRequest: 42 * DAY,
	/** F1, B1 : une candidature non traitée devient urgente */
	applicationUrgent: 7 * DAY
} as const;

/** B3 : au-delà de ce nombre de tâches urgentes, l'admin doit répartir */
export const TASK_OVERLOAD_THRESHOLD = 20;

/** C4 : les champs qui comptent pour une fiche complète */
export const PROFILE_REQUIRED_FIELDS = {
	sex: 'sexe',
	origin: 'origine',
	description: 'description',
	vaccinate: 'vaccination'
} as const;

// =====================================================================
// Le tableau « À traiter » du dashboard : une carte par sujet, une ligne par sorte de tâche.
// Deux tableaux : les actions d'administration (vue « Admin »), et celles d'une bénévole
// (son dashboard, la vue « Bénévole » de l'admin, le panneau de la page Bénévoles).
// =====================================================================

export type TaskBoardRow = {
	key: string;
	label: string;
	rules: TaskRule[];
	/** Seulement pour ce rôle (« À mettre en avant » : les bénévoles communication) */
	onlyRole?: 'COMMUNICATION';
};

export type TaskBoardCard = {
	key: 'sos' | 'cats' | 'adoptions' | 'applications';
	title: string;
	rows: TaskBoardRow[];
};

export type TaskBoardKind = 'ADMIN' | 'VOLUNTEER';

export const TASK_BOARDS: Record<TaskBoardKind, TaskBoardCard[]> = {
	ADMIN: [
		{
			key: 'sos',
			title: 'SOS',
			rows: [{ key: 'sos-new', label: 'À prendre en charge', rules: ['S1'] }]
		},
		{
			key: 'cats',
			title: 'Placements',
			rows: [
				{ key: 'cat-home', label: "Sans famille d'accueil", rules: ['C1'] },
				{ key: 'cat-proposal', label: 'Propositions sans réponse', rules: ['C2'] },
				{ key: 'cat-volunteer', label: 'Sans bénévole', rules: ['C3'] },
				{ key: 'cat-promote', label: 'À mettre en avant', rules: ['C6'] }
			]
		},
		{
			key: 'applications',
			title: 'Candidatures',
			rows: [
				{ key: 'apply-host', label: "Familles d'accueil", rules: ['F1'] },
				{ key: 'apply-volunteer', label: 'Bénévoles', rules: ['B1'] },
				{ key: 'invitations', label: 'Invitations expirées', rules: ['F2', 'B2'] },
				{ key: 'overload', label: 'Bénévoles surchargées', rules: ['B3'] }
			]
		}
	],
	VOLUNTEER: [
		{
			key: 'sos',
			title: 'SOS',
			rows: [
				{ key: 'sos-new', label: 'À prendre en charge', rules: ['S1'] },
				{ key: 'sos-stale', label: 'Sans nouvelles', rules: ['S2'] }
			]
		},
		{
			key: 'cats',
			title: 'Chats',
			rows: [
				{ key: 'cat-profile', label: 'Fiches incomplètes', rules: ['C4'] },
				{ key: 'cat-promote', label: 'À mettre en avant', rules: ['C6'], onlyRole: 'COMMUNICATION' }
			]
		},
		{
			key: 'adoptions',
			title: 'Adoptions',
			rows: [
				{ key: 'adoption-requests', label: 'Demandes à traiter', rules: ['A3'] },
				{ key: 'adoption-due', label: 'À finaliser', rules: ['A1'] },
				{ key: 'adoption-soon', label: "Fin d'essai proche", rules: ['A2'] }
			]
		}
	]
};
