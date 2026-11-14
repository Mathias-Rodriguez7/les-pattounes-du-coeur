import type { ColabActivity } from '@prisma/client';

// =====================================================================
// La pause d'une bénévole : les règles, écrites UNE fois.
// Utilisées par le Profil (enregistrer une pause) ET par le cron de la nuit.
// Les dates arrivent du DateRangePicker à midi (heure locale) : la pause
// couvre donc toute la journée de début et toute la journée de fin.
// =====================================================================

/** Fin de la journée de `date` (23:59:59.999) */
export function endOfDay(date: Date): Date {
	const end = new Date(date);
	end.setHours(23, 59, 59, 999);
	return end;
}

/** Début de la journée de `date` (00:00) */
export function startOfDay(date: Date): Date {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	return start;
}

/** La pause a-t-elle commencé ? (elle commence dès le jour de début) */
export function breakHasStarted(breakStart: Date, now: Date): boolean {
	return breakStart <= endOfDay(now);
}

/**
 * Le statut juste après avoir enregistré une pause :
 * - arrêtée (STOP) : elle le reste, une pause n'y change rien ;
 * - la pause commence aujourd'hui (ou a commencé) : en pause tout de suite ;
 * - la pause est à venir : active, le cron la passera en pause le jour venu.
 */
export function statusWithBreak(
	current: ColabActivity | null,
	breakStart: Date,
	now: Date = new Date()
): ColabActivity {
	if (current === 'STOP') return 'STOP';
	return breakHasStarted(breakStart, now) ? 'BREAK' : 'ACTIVE';
}
