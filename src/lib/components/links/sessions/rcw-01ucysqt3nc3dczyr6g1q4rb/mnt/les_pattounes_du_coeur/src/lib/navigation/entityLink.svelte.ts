import { tick } from 'svelte';
import { page } from '$app/state';
import { replaceState } from '$app/navigation';

// =====================================================================
// Navigation entre les fiches : un nom cliquable ouvre la page du chat, de la bénévole
// ou de la FA, AVEC son panneau ouvert. L'élément voulu passe dans l'adresse : ?id=…
// =====================================================================

export type EntityKind = 'cat' | 'volunteer' | 'host';

/** Le paramètre de l'adresse qui porte l'élément à ouvrir */
export const ENTITY_PARAM = 'id';

/** La page de chaque sorte de fiche (chemins SK3 : sans « / » au début) */
export const ENTITY_PAGES = {
	cat: 'dashboard/chat',
	volunteer: 'dashboard/benevole',
	host: 'dashboard/famille_d_accueil'
} as const;

/** L'élément demandé par l'adresse (?id=…), ou null */
export function linkedId(): string | null {
	return page.url.searchParams.get(ENTITY_PARAM);
}

/**
 * Garde la ligne choisie dans l'adresse, SANS recharger la page (« shallow routing »).
 * Ainsi, après un clic sur un nom, le bouton « Retour » rouvre le bon panneau.
 */
export function rememberSelection(id: string | null) {
	// page.url est en lecture seule (SK3) : on modifie une copie
	const url = new URL(page.url.href);
	if (id) url.searchParams.set(ENTITY_PARAM, id);
	else url.searchParams.delete(ENTITY_PARAM);
	if (url.href === page.url.href) return;

	// Même page, seul le « ?id » change : resolve() n'a rien à vérifier ici
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	replaceState(url, page.state);
}

/** Fait défiler la liste jusqu'à la ligne (elle porte data-row-id) */
export async function scrollToRow(id: string) {
	await tick();
	document
		.querySelector(`[data-row-id="${CSS.escape(id)}"]`)
		?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
