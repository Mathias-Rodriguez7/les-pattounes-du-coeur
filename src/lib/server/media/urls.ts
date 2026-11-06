/**
 * Adresse à mettre dans la page pour un document.
 * Privé : notre route, qui vérifie la connexion à chaque clic.
 * Public : l'adresse directe du fichier.
 */
import { getPublicUrl } from '$lib/server/storage';

export function getMediaHref(media: {
	id: string;
	storageKey: string;
	isPrivate: boolean;
}): string {
	return media.isPrivate ? `/api/media/${media.id}` : getPublicUrl(media.storageKey);
}
