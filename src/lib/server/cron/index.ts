// src/lib/server/cron/index.ts
import cron from 'node-cron';
import { endFinishedBreaks } from './updateHostVolunteerStatus';
import { generateCatsNews } from '$lib/server/news/catsNews';

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

export function startCrons() {
	// En dev, Vite peut recharger hooks.server.ts plusieurs fois : sans ce verrou,
	// chaque rechargement ajouterait une planification de plus (et des news en double)
	if (globalThis.__cronsStarted) return;
	globalThis.__cronsStarted = true;

	// Tous les jours à 3 h : fin des pauses FA et bénévoles
	cron.schedule('0 3 * * *', () => run('Fin des pauses', endFinishedBreaks), {
		timezone: TIMEZONE
	});

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

	// Au démarrage : rattraper les pauses finies pendant que le serveur était arrêté
	void run('Fin des pauses (démarrage)', endFinishedBreaks);
}
