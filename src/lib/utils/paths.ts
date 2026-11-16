import type { Path } from '$app/types';

/**
 * Pour appeler resolve() avec une VARIABLE de type Path (menu, actions rapides…) :
 *   href={resolve(anyPath(item.href))}
 *
 * Pourquoi ? resolve() vérifie son argument avec un type « distributif » : pour une union de
 * chemins, TypeScript doit comparer chaque chemin à chaque forme possible. Au-delà de 25 chemins,
 * il abandonne (« … is not assignable … ») : c'est arrivé avec la 26e page (Vétérinaires).
 *
 * On lui montre donc UN chemin. Ce n'est pas une perte de sécurité : la variable est déjà typée
 * `Path`, donc chaque chemin a été vérifié là où il est écrit (ex : la liste du menu).
 */
export function anyPath(path: Path) {
	return path as 'dashboard';
}
