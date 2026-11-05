import type { MediaType } from '@prisma/client';

type MediaRule = {
	label: string;
	mimeTypes: readonly string[];
	maxBytes: number;
};

const MB = 1024 * 1024;

/** Source unique : utilisée par MediaUpload (navigateur) ET par le serveur. */
export const MEDIA_RULES = {
	IMAGE: {
		label: 'Image (JPG, PNG, WebP)',
		mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
		maxBytes: 10 * MB
	},
	VIDEO: {
		label: 'Vidéo (MP4, WebM, MOV)',
		mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
		maxBytes: 200 * MB
	},
	DOCUMENT: {
		label: 'PDF',
		mimeTypes: ['application/pdf'],
		maxBytes: 20 * MB
	}
} as const satisfies Record<MediaType, MediaRule>;

/** "application/pdf" → "DOCUMENT". Renvoie null si le format n'est pas accepté. */
export function getMediaTypeFromMime(mimeType: string | null | undefined): MediaType | null {
	if (!mimeType) return null;
	const entries = Object.entries(MEDIA_RULES) as [MediaType, MediaRule][];
	const found = entries.find(([, rule]) => rule.mimeTypes.includes(mimeType));
	return found?.[0] ?? null;
}

/** Valeur de l'attribut accept="" d'un <input type="file"> */
export function getAcceptAttribute(types: MediaType[]): string {
	return types.flatMap((type) => MEDIA_RULES[type].mimeTypes).join(',');
}

export type FileCheck = { ok: true; type: MediaType } | { ok: false; error: string };

/**
 * Vérifie le format et la taille d'un fichier.
 * Prend { type, size } plutôt qu'un File : le serveur pourra l'appeler
 * avec les infos envoyées par le navigateur, sans avoir le fichier lui-même.
 */
export function validateFile(
	file: { type: string; size: number },
	allowed: MediaType[]
): FileCheck {
	const type = getMediaTypeFromMime(file.type);

	if (!type || !allowed.includes(type)) {
		const formats = allowed.map((t) => MEDIA_RULES[t].label).join(', ');
		return { ok: false, error: `Format non accepté. Formats possibles : ${formats}` };
	}

	if (file.size === 0) {
		return { ok: false, error: 'Le fichier est vide' };
	}

	const { maxBytes } = MEDIA_RULES[type];
	if (file.size > maxBytes) {
		return {
			ok: false,
			error: `Fichier trop lourd (${formatBytes(file.size)}). Maximum : ${formatBytes(maxBytes)}`
		};
	}

	return { ok: true, type };
}

/** 2 400 000 → "2,3 Mo" */
export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} o`;
	if (bytes < MB) return `${Math.round(bytes / 1024)} Ko`;
	return `${(bytes / MB).toFixed(1).replace('.', ',')} Mo`;
}

/**
 * ⚠️ TRANSITOIRE : devine le type d'après l'URL, pour les anciens News.mediaUrl
 * qui n'ont pas de mimeType. À supprimer en même temps que mediaUrl.
 */
export function guessMediaTypeFromUrl(url: string): MediaType | null {
	const path = url.split(/[?#]/)[0].toLowerCase(); // retire ?X-Amz-Signature=… et #page=2
	if (path.endsWith('.pdf')) return 'DOCUMENT';
	if (/\.(jpe?g|png|webp|gif)$/.test(path)) return 'IMAGE';
	if (/\.(mp4|webm|mov)$/.test(path)) return 'VIDEO';
	return null;
}
