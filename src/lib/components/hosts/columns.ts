import type { HostFull } from '#lib/types/host.ts';
import {
	HOST_ACTIF_OPTIONS,
	HOST_TYPE_OPTIONS,
	HOST_HEAL_OPTIONS,
	HOST_SOCIALIZE_OPTIONS,
	HOST_BABY_FEEDING_OPTIONS
} from '#lib/constants/host.ts';
import { truncate } from '#lib/utils/string.ts';
import { districtLabel } from '#lib/utils/districts.ts';
import { householdSummary } from '#lib/hosts/household.ts';

// =====================================================================
// Les colonnes du tableau « Proposer à des FA » (HostDataTable).
// accessor : la valeur de la cellule, utilisée pour la recherche, les filtres et le tri.
// L'affichage particulier (badges, icônes…) est dans HostPlacementRow.
// =====================================================================

export type FilterType = 'text' | 'select' | 'boolean';

/** Les sur-titres qui regroupent les colonnes */
export type ColumnGroup = 'Foyer' | 'Capacités' | 'Pratique';

export type ColumnDef = {
	id: string;
	header: string;
	/** Le libellé complet, au survol de l'en-tête (quand `header` est abrégé) */
	title?: string;
	group?: ColumnGroup;
	accessor: (row: HostFull) => unknown;
	sortable?: boolean;
	/** Colonne non affichée : elle ne sert qu'au filtre (ex : Statut, Disponible) */
	hidden?: boolean;
	filter?: {
		type: FilterType;
		options?: { label: string; value: string }[];
	};
};

/** Le lieu : le quartier pour Montpellier (« Port-Marianne »), sinon la ville (« Lattes ») */
export function hostLocation(host: HostFull): string {
	const isMontpellier = host.profil.city?.trim().toLowerCase() === 'montpellier';
	return (isMontpellier && districtLabel(host.profil.district)) || host.profil.city || '—';
}

/**
 * Les animaux du foyer, en texte : « 2 chats · 1 chien · lapin ».
 * Sert à la recherche ; le tableau, lui, affiche des icônes (HostPlacementRow).
 */
export function animalsSummary(host: HostFull): string {
	if (!host.hasAnimalsAtHome) return 'Aucun';
	const cats = host.numberOfCatsAtHome ?? 0;
	const dogs = host.numberOfDogsAtHome ?? 0;
	const parts = [
		cats ? `${cats} chat${cats > 1 ? 's' : ''}` : null,
		dogs ? `${dogs} chien${dogs > 1 ? 's' : ''}` : null,
		host.otherAnimalsAtHome || null
	].filter(Boolean);
	return parts.join(' · ') || 'Oui';
}

/** Les chats qu'elle accepte : « 2 adultes · 3 chatons · mère + petits » */
export function catTypesSummary(host: HostFull): string {
	const parts = [
		host.catAdult ? `${host.catAdult} adulte${host.catAdult > 1 ? 's' : ''}` : null,
		host.kitten ? `${host.kitten} chaton${host.kitten > 1 ? 's' : ''}` : null,
		host.kittyAndKitten ? 'mère + petits' : null
	].filter(Boolean);
	return parts.join(' · ') || '—';
}

/** Ses places : chats placés en ce moment / chats qu'elle accepte (adultes + chatons) */
export function hostPlaces(host: HostFull) {
	const taken = (host.placements ?? []).filter(
		(p) => p.status === 'ACTIVE' && p.type !== 'PROPOSAL'
	).length;
	const capacity = (host.catAdult ?? 0) + (host.kitten ?? 0);
	return { taken, capacity, free: capacity - taken, isFull: capacity > 0 && taken >= capacity };
}

export const columns: ColumnDef[] = [
	{
		id: 'name',
		header: 'Nom',
		accessor: (row) => `${truncate(row.profil.firstName, 20)} ${truncate(row.profil.lastName, 1)}.`,
		sortable: true,
		filter: { type: 'text' }
	},
	{
		id: 'location',
		header: 'Lieu',
		title: 'Quartier pour Montpellier, ville ailleurs',
		accessor: hostLocation,
		sortable: true,
		filter: { type: 'text' }
	},

	// --- Filtres seuls (non affichés) ---
	{
		id: 'actif',
		header: 'Statut',
		accessor: (row) => row.actif,
		hidden: true,
		filter: { type: 'select', options: HOST_ACTIF_OPTIONS }
	},
	{
		id: 'isAvailable',
		header: 'Disponible',
		accessor: (row) => row.isAvailable,
		hidden: true,
		filter: { type: 'boolean' }
	},

	// --- Foyer ---
	{
		id: 'household',
		header: 'Foyer',
		group: 'Foyer',
		accessor: (row) => householdSummary(row) ?? '—'
	},
	{
		id: 'animals',
		header: 'Animaux',
		group: 'Foyer',
		accessor: animalsSummary
	},

	// --- Capacités ---
	{
		id: 'catTypes',
		header: 'Accueille',
		group: 'Capacités',
		accessor: catTypesSummary
	},
	{
		id: 'socialize',
		header: 'Socia.',
		title: 'Sociabilisation',
		group: 'Capacités',
		accessor: (row) => row.socialize,
		filter: { type: 'select', options: HOST_SOCIALIZE_OPTIONS }
	},
	{
		id: 'heal',
		header: 'Soins',
		group: 'Capacités',
		accessor: (row) => row.heal,
		filter: { type: 'select', options: HOST_HEAL_OPTIONS }
	},
	{
		id: 'babyFeeding',
		header: 'Biberon.',
		title: 'Biberonnage',
		group: 'Capacités',
		accessor: (row) => row.babyFeeding,
		filter: { type: 'select', options: HOST_BABY_FEEDING_OPTIONS }
	},

	// --- Pratique ---
	{
		id: 'type',
		header: 'Type',
		title: "Type d'accueil",
		group: 'Pratique',
		accessor: (row) => row.type ?? '—',
		filter: { type: 'select', options: HOST_TYPE_OPTIONS }
	},
	{
		id: 'outside',
		header: 'Ext.',
		title: 'Extérieur',
		group: 'Pratique',
		accessor: (row) => row.outside,
		filter: { type: 'boolean' }
	},
	{
		id: 'car',
		header: 'Voiture',
		group: 'Pratique',
		accessor: (row) => row.car,
		filter: { type: 'boolean' }
	},
	{
		id: 'places',
		header: 'Places',
		title: 'Chats placés / chats acceptés (trié par places libres)',
		group: 'Pratique',
		accessor: (row) => hostPlaces(row).free,
		sortable: true
	},
	{
		id: 'space',
		header: 'Espace',
		title: 'Espace en m²',
		group: 'Pratique',
		accessor: (row) => row.space,
		sortable: true
	}
];
