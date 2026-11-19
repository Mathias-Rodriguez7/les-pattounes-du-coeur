import { tick } from 'svelte';
import { page } from '$app/state';
import { replaceState } from '$app/navigation';
import { ENTITY_PARAM } from './entityPages.ts';

// =====================================================================
// Navigation entre les fiches : un nom cliquable ouvre la page du chat, de la bénévole
// ou de la FA, AVEC son panneau ouvert. L'élément voulu passe dans l'adresse : ?id=…
// =====================================================================

// La page de chaque fiche : dans entityPages.ts (le serveur s'en sert aussi)
export { ENTITY_PAGES, ENTITY_PARAM, type EntityKind } from './entityPages.ts';

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

// =====================================================================
// « Créer » depuis le dashboard : la page s'ouvre avec son formulaire de création (?nouveau=1)
// =====================================================================

/** Le paramètre qui demande d'ouvrir le formulaire de création */
export const NEW_PARAM = 'nouveau';

/**
 * L'adresse demande-t-elle d'ouvrir le formulaire de création ? Si oui, on retire le
 * paramètre (un rechargement de la page ne le rouvrira pas). À appeler dans afterNavigate :
 * replaceState n'est pas permis avant la fin du premier chargement.
 */
export function takeNewParam(): boolean {
	if (!page.url.searchParams.has(NEW_PARAM)) return false;
	const url = new URL(page.url.href);
	url.searchParams.delete(NEW_PARAM);
	// Même page, seul le paramètre change : resolve() n'a rien à vérifier ici
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	replaceState(url, page.state);
	return true;
}
