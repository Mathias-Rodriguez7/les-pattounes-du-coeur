import type { VolunteerRole } from '@prisma/client';
import {
	TASK_BOARDS,
	TASK_URGENCY_ORDER,
	type TaskBoardKind,
	type TaskUrgency
} from '#lib/constants/tasks.ts';
import type { Task } from './tasks.ts';

// Le tableau « À traiter » : les tâches rangées dans les cartes et les lignes de TASK_BOARDS.
// Pur (pas de base, pas d'affichage) : testé à part.

const urgencyRank = (urgency: TaskUrgency) => TASK_URGENCY_ORDER.indexOf(urgency);

/** La plus pressée d'abord, puis la situation la plus ancienne */
export function sortTasks(tasks: Task[]) {
	return [...tasks].sort(
		(a, b) =>
			urgencyRank(a.urgency) - urgencyRank(b.urgency) || a.since.getTime() - b.since.getTime()
	);
}

type BoardOptions = {
	/** Le rôle de la personne dont on montre les tâches (« À mettre en avant » : communication) */
	role?: VolunteerRole;
	/** Sans les lignes vides (et les cartes vides) : le panneau d'une bénévole */
	hideEmpty?: boolean;
};

export function buildBoard(tasks: Task[], kind: TaskBoardKind, options: BoardOptions = {}) {
	return TASK_BOARDS[kind]
		.map((card) => ({
			...card,
			rows: card.rows
				.filter((row) => !row.onlyRole || row.onlyRole === options.role)
				.map((row) => {
					const rowTasks = sortTasks(tasks.filter((task) => row.rules.includes(task.rule)));
					// La couleur de la pastille : la tâche la plus pressée de la ligne (null : rien)
					return { ...row, tasks: rowTasks, urgency: rowTasks[0]?.urgency ?? null };
				})
				.filter((row) => !options.hideEmpty || row.tasks.length > 0)
		}))
		.filter((card) => card.rows.length > 0);
}

export type TaskBoard = ReturnType<typeof buildBoard>;

/** Combien de tâches par urgence (« 13 urgentes · 4 cette semaine ») */
export function countByUrgency(tasks: Task[]) {
	const counts: Record<TaskUrgency, number> = { URGENT: 0, WEEK: 0, WATCH: 0 };
	for (const task of tasks) counts[task.urgency]++;
	return counts;
}

/** Les tâches de chaque bénévole (page Bénévoles : colonne « À faire », filtres, panneau) */
export function tasksByVolunteer(tasks: Task[]) {
	const byVolunteer: Record<string, Task[]> = {};
	for (const task of tasks) {
		if (task.audience.kind !== 'VOLUNTEERS') continue;
		for (const id of task.audience.ids) (byVolunteer[id] ??= []).push(task);
	}
	return byVolunteer;
}
