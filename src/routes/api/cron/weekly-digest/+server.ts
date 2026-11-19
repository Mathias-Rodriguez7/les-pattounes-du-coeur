import { error, json } from '@sveltejs/kit';
import { timingSafeEqual } from 'node:crypto';
import { CRON_SECRET } from '$app/env/private';
import { sendWeeklyDigests } from '#lib/server/digest.ts';
import type { RequestHandler } from './$types';

// Le récapitulatif du lundi, déclenché par une tâche planifiée du serveur (cron) :
//   curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/weekly-digest
// Sans la bonne clé : refusé. Sans clé configurée : désactivé.

/** Compare sans laisser deviner la clé au temps de réponse */
function sameSecret(given: string, expected: string) {
	const a = Buffer.from(given);
	const b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}

export const POST: RequestHandler = async ({ request }) => {
	if (!CRON_SECRET) error(503, 'Récapitulatif désactivé (CRON_SECRET absent)');

	const header = request.headers.get('authorization') ?? '';
	const given = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
	if (!sameSecret(given, CRON_SECRET)) error(401, 'Non autorisé');

	const result = await sendWeeklyDigests();
	return json(result);
};
