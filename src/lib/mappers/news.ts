import type { PrismaNewsWithCats } from '$lib/types/prisma/news';
import type { News } from '$lib/types/news';
import type { NewsType } from '@prisma/client';
import { formatDate } from '$lib/utils/date';
import { mapCat } from '$lib/mappers/cats';

const newsImages: Record<NewsType, string> = {
	NEWS: '/img/news/news.png',
	EVENT: '/img/news/event.png',
	HISTORY: '/img/news/historic.png',
	NEWSCATS: '/img/news/cat.news.png',
	NEWSLETTER: '/img/news/news.letter.png'
};

export function mapNews(news: PrismaNewsWithCats): News {
	return {
		id: news.id,
		title: news.title,
		content: news.content,
		type: news.type,

		mediaUrl: news.mediaUrl ?? null,

		createdAt: news.created_at,
		formattedDate: formatDate(news.created_at),

		image: newsImages[news.type],

		cats: news.cats.map((nc) => mapCat(nc.cat))
	};
}
