import { untrack } from 'svelte';
import { page } from '$app/state';
import { afterNavigate, replaceState } from '$app/navigation';

// Les filtres d'une liste gardés dans l'adresse (?statut=NEW&age=Junior) :
// - un rechargement (ou une action qui recharge) ne les perd plus ;
// - on peut envoyer le lien d'une liste filtrée à une autre bénévole.
// Une valeur égale à celle par défaut n'est pas écrite (adresse courte).

/** La valeur de départ d'un filtre : celle de l'adresse, sinon celle par défaut */
export function urlFilter(key: string, fallback = ''): string {
	const value = page.url.searchParams.get(key);
	// « tous » : le filtre a été vidé alors qu'il a une valeur par défaut (ex : statut « Actives »)
	if (value === ALL) return '';
	return value ?? fallback;
}

const ALL = 'tous';

/**
 * Recopie les filtres dans l'adresse à chaque changement, sans recharger la page.
 * À appeler pendant l'initialisation du composant.
 * @param read  () => ({ statut: statusFilter, age: ageFilter, … })
 * @param defaults  les valeurs par défaut ({ statut: 'NEW' }), absentes de l'adresse
 */
export function syncFiltersToUrl(
	read: () => Record<string, string>,
	defaults: Record<string, string> = {}
) {
	// replaceState n'est pas permis avant la fin du premier chargement
	let ready = $state(false);
	afterNavigate(() => (ready = true));

	$effect(() => {
		// Ne dépend QUE des filtres : changer l'adresse ne doit pas relancer cet effet
		// (sinon : adresse → effet → adresse… et les autres effets de la page qui lisent l'adresse)
		const values = read();
		if (!ready) return;
		untrack(() => {
			// Une copie de travail, jetée aussitôt : pas besoin d'une URL réactive (SvelteURL)
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const url = new URL(page.url.href);
			for (const [key, value] of Object.entries(values)) {
				if (value && value !== (defaults[key] ?? '')) url.searchParams.set(key, value);
				else if (!value && defaults[key]) url.searchParams.set(key, ALL);
				else url.searchParams.delete(key);
			}
			if (url.href === page.url.href) return;
			try {
				// La même page, seuls ses paramètres changent (comme rememberSelection)
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				replaceState(url, page.state);
			} catch (error) {
				// Garder les filtres dans l'adresse est un confort : jamais une raison de planter la page
				console.warn('Filtres non recopiés dans l’adresse', error);
			}
		});
	});
}
