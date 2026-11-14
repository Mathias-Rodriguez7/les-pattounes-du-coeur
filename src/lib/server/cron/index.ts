// src/lib/server/cron/index.ts
import cron from 'node-cron';
import { endFinishedBreaks, startScheduledBreaks } from './updateHostVolunteerStatus';
import { generateCatsNews } from '#lib/server/news/catsNews.ts';

const TIMEZONE = 'Europe/Paris';

/** Lance une tâche en attrapant ses erreurs : une tâche qui plante ne doit pas arrêter les autres */
async function run(name: string, task: () => Promise<unknown>) {
	try {
		await task();
		console.log(`⏰ [cron] ${name} : terminé`);
	} catch (error) {
		console.error(`⏰ [cron] ${name} : erreur`, error);
	}
}

/** D'abord terminer, puis commencer : une pause qui se termine ne doit pas être relancée */
async function updateBreaks() {
	await endFinishedBreaks();
	await startScheduledBreaks();
}

export function startCrons() {
	// En dev, Vite peut recharger hooks.server.ts plusieurs fois : sans ce verrou,
	// chaque rechargement ajouterait une planification de plus (et des news en double)
	if (globalThis.__cronsStarted) return;
	globalThis.__cronsStarted = true;

	// Tous les jours à 3 h : fin des pauses (FA et bénévoles), puis début des pauses prévues
	cron.schedule('0 3 * * *', () => run('Pauses', updateBreaks), { timezone: TIMEZONE });

	// Le dimanche à 8 h : News chats de la semaine (aucune si aucun candidat)
	cron.schedule(
		'0 8 * * 0',
		() =>
			run('News chats', async () => {
				const news = await generateCatsNews();
				console.log(
					news ? `📰 ${news.title} (${news._count.cats} chats)` : '📰 Aucun chat à annoncer'
				);
			}),
		{ timezone: TIMEZONE }
	);

	// Au démarrage : rattraper les pauses finies ou commencées pendant que le serveur était arrêté
	void run('Pauses (démarrage)', updateBreaks);
}
