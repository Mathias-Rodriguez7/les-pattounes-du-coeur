import { TASK_URGENCY_ORDER, type TaskUrgency } from '#lib/constants/tasks.ts';
import type { Task } from './tasks.ts';

// « Plus tard » : une personne met une tâche de côté, pour elle seule, jusqu'à une date.
// Elle revient à cette date, ou PLUS TÔT si elle est devenue plus urgente entre-temps.
// Pur (pas de base) : testé à part.

/** Au plus 3 mois : une tâche ne s'oublie pas indéfiniment */
export const MAX_SNOOZE_DAYS = 90;

export type TaskSnoozeView = {
	taskId: string;
	until: Date;
	note: string | null;
	/** L'urgence de la tâche au moment où elle a été mise de côté */
	urgency: TaskUrgency;
};

export type SnoozedTask = { task: Task; until: Date; note: string | null };

const rank = (urgency: TaskUrgency) => TASK_URGENCY_ORDER.indexOf(urgency);

/** Les tâches à faire maintenant, et celles mises de côté (la date la plus proche d'abord) */
export function applySnoozes(tasks: Task[], snoozes: TaskSnoozeView[], now: Date) {
	const byTask = new Map(
		snoozes.filter((snooze) => snooze.until > now).map((snooze) => [snooze.taskId, snooze])
	);
	const active: Task[] = [];
	const snoozed: SnoozedTask[] = [];
	for (const task of tasks) {
		const snooze = byTask.get(task.id);
		// Devenue plus urgente qu'au moment où on l'a mise de côté : elle revient
		if (snooze && rank(task.urgency) >= rank(snooze.urgency)) {
			snoozed.push({ task, until: snooze.until, note: snooze.note });
		} else {
			active.push(task);
		}
	}
	snoozed.sort((a, b) => a.until.getTime() - b.until.getTime());
	return { active, snoozed };
}

/** Les choix rapides du bouton « Plus tard » (en jours) */
export const SNOOZE_CHOICES = [
	{ days: 1, label: 'Demain' },
	{ days: 7, label: 'Dans 1 semaine' },
	{ days: 21, label: 'Dans 3 semaines' }
] as const;
