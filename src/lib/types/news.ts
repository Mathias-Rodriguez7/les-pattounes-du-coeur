import type { NewsType } from '@prisma/client';
import type { CatListItem } from '$lib/types/cat';

export interface NewsFull {
	id: string;
	title: string;
	content: string | null;
	type: NewsType;
	mediaUrl: string | null;
	/** Document stocké sur S3 (nouveau système). mediaUrl reste pour les anciennes news */
	mediaFile: { url: string; mimeType: string; sizeBytes: number; name: string | null } | null;
	createdAt: Date;
	cats: CatListItem[];
}

export interface NewsEditData {
	title: string;
	content: string;
	type: NewsType;
	mediaUrl: string;
	catIds: string[];
}
