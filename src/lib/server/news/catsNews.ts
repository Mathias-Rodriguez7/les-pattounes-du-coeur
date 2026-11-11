// src/lib/server/news/catsNews.ts
import prisma from '$lib/server/prisma';

/** La fenêtre de la règle : 7 jours glissants */
const WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const windowStart = (now: Date) => new Date(now.getTime() - WINDOW_DAYS * DAY_MS);

/** « Les chats à l'adoption – semaine du 9 novembre 2026 » (date à l'heure de Paris) */
function defaultTitle(now: Date) {
	const date = now.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'Europe/Paris'
	});
	return `Les chats à l'adoption – semaine du ${date}`;
}

/**
 * Les chats à annoncer :
 * 1. visibles et à l'adoption,
 * 2. publiés dans les 7 derniers jours,
 * 3. pas déjà dans une News chats créée pendant ces 7 jours.
 */
export async function getNewsCatsCandidateIds(now = new Date()): Promise<string[]> {
	const since = windowStart(now);

	const cats = await prisma.cat.findMany({
		where: {
			isVisible: true,
			status: 'AVAILABLE',
			publishedAt: { gte: since },
			// « aucune » de ses lignes NewsCat ne pointe vers une News chats récente
			news: { none: { news: { type: 'NEWSCATS', createdAt: { gte: since } } } }
		},
		select: { id: true },
		orderBy: { publishedAt: 'asc' }
	});

	return cats.map((cat) => cat.id);
}

/**
 * Crée une News chats.
 * - Sans catIds (cron du dimanche) : avec les candidats.
 * - Avec catIds (bouton « Générer ») : avec la sélection de la bénévole.
 * Renvoie null s'il n'y a aucun chat à annoncer : on ne crée jamais de news vide.
 */
export async function generateCatsNews({
	title,
	catIds
}: { title?: string; catIds?: string[] } = {}) {
	const now = new Date();
	const requestedIds = catIds ?? (await getNewsCatsCandidateIds(now));
	if (requestedIds.length === 0) return null;

	// On ne garde que des chats qui existent ET sont encore à l'adoption :
	// entre l'ouverture du dialogue et le clic, un chat a pu être adopté
	const validCats = await prisma.cat.findMany({
		where: { id: { in: requestedIds }, isVisible: true, status: 'AVAILABLE' },
		select: { id: true }
	});
	if (validCats.length === 0) return null;

	return prisma.news.create({
		data: {
			title: title?.trim() || defaultTitle(now),
			type: 'NEWSCATS',
			content: null,
			cats: { create: validCats.map(({ id }) => ({ catId: id })) }
		},
		select: { id: true, title: true, _count: { select: { cats: true } } }
	});
}
