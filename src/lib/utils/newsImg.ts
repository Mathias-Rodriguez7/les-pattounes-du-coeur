import type { NewsType } from '@prisma/client';

export function getNewsImage(type: NewsType): string {
	const images: Record<NewsType, string> = {
		NEWS: '/img/news/news.webp',
		NEWSLETTER: '/img/news/news.letter.webp',
		HISTORY: '/img/news/historic.webp',
		NEWSCATS: '/img/news/cat.news.webp',
		EVENT: '/img/news/event.webp'
	};

	return images[type] || '/img/news/news.webp';
}
