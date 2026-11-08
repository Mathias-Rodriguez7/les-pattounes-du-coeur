import type { NewsType } from '@prisma/client';
import type { CatListItem } from '$lib/types/cat';

/** Le document d'une news, prêt à afficher */
export type NewsMediaFile = {
	url: string;
	mimeType: string;
	sizeBytes: number;
	name: string | null;
};

export interface NewsFull {
	id: string;
	title: string;
	content: string | null;
	type: NewsType;
	mediaFile: NewsMediaFile | null;
	createdAt: Date;
	cats: CatListItem[];
}

export interface NewsEditData {
	title: string;
	content: string;
	type: NewsType;
	/** Le document actuel, pour l'afficher dans le formulaire (jamais envoyé au serveur) */
	currentMedia: NewsMediaFile | null;
	catIds: string[];
}
