import type { MediaCat, MediaType } from '@prisma/client';

// Un média tel que renvoyé par Prisma (aucun champ calculé)
export type CatMedia = MediaCat;

// Variante pour l'affichage : seulement les images, avec focal point
export type CatImage = Pick<
	MediaCat,
	'id' | 'url' | 'originalName' | 'isPrimary' | 'focalPointX' | 'focalPointY'
>;

// Pour les uploads (formulaire, action SvelteKit)
export type MediaUploadInput = {
	type: MediaType;
	url: string;
	storageKey: string;
	mimeType: string;
	sizeBytes: number;
	originalName?: string | null;
	isPrimary?: boolean;
	focalPointX?: number;
	focalPointY?: number;
};

// Structure minimale d'un focal point (0-100)
export type FocalPoint = {
	focalPointX: number;
	focalPointY: number;
};
