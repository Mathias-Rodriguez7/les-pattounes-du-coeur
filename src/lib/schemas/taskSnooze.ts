import { z } from 'zod';
import { emptyToNull, optionalText } from '#lib/schemas/place.ts';

// « Plus tard » : l'identifiant d'une tâche calculée (« C4:<uuid> », « B3:<uuid> »…)
const taskId = z
	.string()
	.trim()
	.max(100)
	.regex(/^[A-Z]\d:[\w-]+$/, 'Tâche invalide');

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide');

/** Mettre une tâche de côté : un choix rapide (`quick`) ou une date du calendrier (`until`) */
export const snoozeTaskSchema = z
	.object({
		taskId,
		urgency: z.enum(['URGENT', 'WEEK', 'WATCH']),
		quick: z.preprocess(emptyToNull, day.nullish()),
		until: z.preprocess(emptyToNull, day.nullish()),
		note: optionalText(255)
	})
	.refine((data) => !!(data.quick ?? data.until), {
		message: 'Choisissez une date',
		path: ['until']
	});

export const resumeTaskSchema = z.object({ taskId });
