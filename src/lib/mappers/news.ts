import type { PrismaNewsWithCats } from '$lib/types/news';
import type { News } from '$lib/types/news';
import type { NewsType } from '@prisma/client';

const newsImages: Record<NewsType, string> = {
	NEWS: '/img/news/news.png',
	EVENT: '/img/news/event.png',
	HISTORY: '/img/news/historic.png',
	NEWSCATS: '/img/news/cat.news.png',
	NEWSLETTER: '/img/news/news.letter.png'
};

export function mapNews(news: PrismaNewsWithCats): News {
	const { id, title, content, type, created_at, cats } = news;

	return {
		id,
		title,
		content,
		type,
		createdAt: created_at,

		image: newsImages[type] ?? '/img/news/default.png',

		cats:
			cats?.map((nc) => ({
				id: nc.cat.id,
				name: nc.cat.name,
				picture: nc.cat.media?.[0]?.picture ?? null
			})) ?? []
	};
}
