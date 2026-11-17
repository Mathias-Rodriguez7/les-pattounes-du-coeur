import type { VolunteerRole } from '@prisma/client';
import {
	TASK_BOARD,
	TASK_URGENCY_ORDER,
	type TaskBoardAudience,
	type TaskUrgency
} from '#lib/constants/tasks.ts';
import type { Task, TaskFocus } from './tasks.ts';

// Le tableau « À traiter » : les tâches rangées dans les cartes et les lignes de TASK_BOARD.
// Pur (pas de base, pas d'affichage) : testé à part.

/** Les lignes qu'on montre : selon le rôle, et la vue de l'admin (les tâches d'une bénévole) */
function rowIsShown(audience: TaskBoardAudience, role: VolunteerRole, focus: TaskFocus) {
	if (role === 'ADMIN' && focus.kind !== 'VOLUNTEER') return true;
	if (audience === 'EVERYONE') return true;
	return audience === 'ADMIN_COMMUNICATION' && role === 'COMMUNICATION';
}

const urgencyRank = (urgency: TaskUrgency) => TASK_URGENCY_ORDER.indexOf(urgency);

/** La plus pressée d'abord, puis la situation la plus ancienne */
export function sortTasks(tasks: Task[]) {
	return [...tasks].sort(
		(a, b) =>
			urgencyRank(a.urgency) - urgencyRank(b.urgency) || a.since.getTime() - b.since.getTime()
	);
}

export function buildBoard(
	tasks: Task[],
	role: VolunteerRole,
	focus: TaskFocus = { kind: 'MINE' }
) {
	return TASK_BOARD.map((card) => ({
		...card,
		rows: card.rows
			.filter((row) => rowIsShown(row.for, role, focus))
			.map((row) => {
				const rowTasks = sortTasks(tasks.filter((task) => row.rules.includes(task.rule)));
				return {
					...row,
					tasks: rowTasks,
					// La couleur de la pastille : la tâche la plus pressée de la ligne (null : rien)
					urgency: rowTasks[0]?.urgency ?? null
				};
			})
	})).filter((card) => card.rows.length > 0);
}

export type TaskBoard = ReturnType<typeof buildBoard>;

/** Combien de tâches par urgence (l'en-tête « 13 urgentes · 4 cette semaine ») */
export function countByUrgency(tasks: Task[]) {
	const counts: Record<TaskUrgency, number> = { URGENT: 0, WEEK: 0, WATCH: 0 };
	for (const task of tasks) counts[task.urgency]++;
	return counts;
}
