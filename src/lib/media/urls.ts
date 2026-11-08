// Utilisable côté navigateur ET serveur : seules les variables PUBLIC_ sont lues
import { env } from '$env/dynamic/public';

/** Adresse d'un fichier du bucket PUBLIC (photos, vidéos, PDF des news) */
export function publicMediaUrl(storageKey: string): string {
	const base = (env.PUBLIC_MEDIA_BASE_URL ?? '').replace(/\/$/, '');
	return `${base}/${storageKey}`;
}
