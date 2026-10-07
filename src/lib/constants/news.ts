export const NEWS_TYPE_OPTIONS = [
	{ value: 'NEWS', label: 'Actualité' },
	{ value: 'NEWSLETTER', label: 'Newsletter' },
	{ value: 'HISTORY', label: 'Histoire' },
	{ value: 'NEWSCATS', label: 'Nouvelles des chats' },
	{ value: 'EVENT', label: 'Évènement' }
];

export const NEWS_TYPE_CONFIG: Record<
	string,
	{ label: string; icon: string; theme: string; color: string }
> = {
	NEWS: { label: 'Actu', icon: 'news', theme: 'fa', color: 'bg-blue-100 text-blue-800' },
	NEWSLETTER: {
		label: 'Letter',
		icon: 'mail',
		theme: 'cats',
		color: 'bg-purple-100 text-purple-800'
	},
	HISTORY: {
		label: 'Histoire',
		icon: 'book',
		theme: 'break',
		color: 'bg-amber-100 text-amber-800'
	},
	NEWSCATS: {
		label: 'Chats',
		icon: 'cat',
		theme: 'socializing',
		color: 'bg-pink-100 text-pink-800'
	},
	EVENT: {
		label: 'Event',
		icon: 'megaphone',
		theme: 'adoptions',
		color: 'bg-green-100 text-green-800'
	}
};

export const NEWS_SECTION_CONFIG = {
	summary: { icon: 'news', label: 'Résumé', color: 'blue' },
	content: { icon: 'pen', label: 'Contenu', color: 'indigo' },
	media: { icon: 'image', label: 'Média', color: 'purple' },
	cats: { icon: 'cat', label: 'Chats concernés', color: 'orange' }
} as const;

export const typesColors: Record<string, { label: string; color: string }> = {
	NEWS: { label: 'News', color: 'bg-purple-100 text-purple-800' },
	NEWSLETTER: { label: 'Newsletter', color: 'bg-orange-100 text-orange-800' },
	HISTORY: { label: 'Histoire', color: 'bg-green-100 text-green-800' },
	NEWSCATS: { label: 'News chats', color: 'bg-cyan-100 text-cyan-800' },
	EVENT: { label: 'Évènement', color: 'bg-pink-100 text-pink-800' }
};
