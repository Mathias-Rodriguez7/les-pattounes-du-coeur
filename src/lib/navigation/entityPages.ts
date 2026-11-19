// La page de chaque sorte de fiche, et le paramètre qui ouvre son panneau (?id=…).
// Sans dépendance au navigateur : le serveur s'en sert aussi (les liens des emails).

export type EntityKind = 'cat' | 'volunteer' | 'host' | 'sos';

/** Le paramètre de l'adresse qui porte l'élément à ouvrir */
export const ENTITY_PARAM = 'id';

/** La page de chaque sorte de fiche (chemins SK3 : sans « / » au début) */
export const ENTITY_PAGES = {
	cat: 'dashboard/chat',
	volunteer: 'dashboard/benevole',
	host: 'dashboard/famille_d_accueil',
	sos: 'dashboard/sos'
} as const;
