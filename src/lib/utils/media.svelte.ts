import { MediaQuery } from 'svelte/reactivity';

/**
 * true à partir de 1024 px (le point de rupture `lg:` de Tailwind).
 * Le 2ᵉ argument est la valeur utilisée côté serveur (SSR), où il n'y a pas d'écran : ordinateur.
 * UNE instance pour toute l'app : la largeur n'est écrite qu'ici.
 * (.svelte.ts : extension obligatoire pour utiliser la réactivité de Svelte hors d'un composant)
 */
export const desktop = new MediaQuery('min-width: 1024px', true);
