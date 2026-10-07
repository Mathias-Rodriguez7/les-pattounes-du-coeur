import type { NewsType } from '@prisma/client';

export function getNewsImage(type: NewsType): string {
	const images: Record<NewsType, string> = {
		NEWS: '/img/news/news.png',
		NEWSLETTER: '/img/news/news.letter.png',
		HISTORY: '/img/news/historic.png',
		NEWSCATS: '/img/news/cat.news.png',
		EVENT: '/img/news/event.png'
	};

	return images[type] || '/img/news/default.png';
}
