import type { HostFull } from '#lib/types/host.ts';
import {
	HOST_ACTIF_OPTIONS,
	HOST_TYPE_OPTIONS,
	HOST_HEAL_OPTIONS,
	HOST_SOCIALIZE_OPTIONS,
	HOST_BABY_FEEDING_OPTIONS
} from '#lib/constants/host.ts';
import { truncate } from '#lib/utils/string.ts';
import { placeLabel } from '#lib/utils/districts.ts';
import { HOUSEHOLD_FIELDS } from '#lib/hosts/household.ts';

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
	/**
	 * Petite colonne de chiffres (foyer, chats acceptés) : centrée, flèche de tri seulement
	 * quand on trie dessus. `count` : un nombre (-1 = non renseigné → « — », 0 → « · »).
	 * `check` : oui / non (1 / 0) → l'icône oui/non. `other` : les « autres animaux » (texte libre)
	 * → une patte quand il y en a, le texte au survol (ou à l'appui sur mobile).
	 */
	compact?: 'count' | 'check' | 'other';
	/** Un trait vertical avant la colonne, à l'intérieur d'un groupe (ex : foyer | animaux) */
	separatorBefore?: boolean;
	/** Centrer la colonne (badges, icônes oui/non, places) : les cellules ne « flottent » plus */
	center?: boolean;
	/** Une icône à la place du texte de l'en-tête (le texte reste au survol, via `title`) */
	headerIcon?: 'cat' | 'dog' | 'paw';
	filter?: {
		type: FilterType;
		options?: { label: string; value: string }[];
	};
};

/** Le lieu : le quartier pour Montpellier (« Port-Marianne »), sinon la ville (« Lattes ») */
export function hostLocation(host: HostFull): string {
	return placeLabel(host.profil).label;
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

/** Les en-têtes courts des colonnes du foyer (le libellé complet s'affiche au survol) */
const HOUSEHOLD_HEADERS: Record<(typeof HOUSEHOLD_FIELDS)[number]['key'], string> = {
	adultsAtHome: 'Ad.',
	childrenAtHome: 'Enf.'
};

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
		accessor: (row) => `${truncate(row.profil.firstName, 20)} ${truncate(row.profil.lastName, 1)}`,
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
	// Une petite colonne par âge : « · » pour 0, « — » si le foyer n'est pas renseigné
	...HOUSEHOLD_FIELDS.map((field): ColumnDef => ({
		id: field.key,
		header: HOUSEHOLD_HEADERS[field.key],
		title: `${field.label} (${field.hint})`,
		group: 'Foyer',
		compact: 'count',
		accessor: (row) => row[field.key] ?? -1,
		sortable: true
	})),
	// Les animaux qu'elle A (à ne pas confondre avec les chats qu'elle ACCUEILLE, plus loin) :
	// des en-têtes en icônes, des chiffres dessous
	{
		id: 'catsAtHome',
		header: 'Chats',
		headerIcon: 'cat',
		// Un trait sépare les personnes (Ad., Ado…) des animaux
		separatorBefore: true,
		title: 'Chats au foyer',
		group: 'Foyer',
		compact: 'count',
		accessor: (row) => (row.hasAnimalsAtHome ? (row.numberOfCatsAtHome ?? 0) : 0),
		sortable: true
	},
	{
		id: 'dogsAtHome',
		header: 'Chiens',
		headerIcon: 'dog',
		title: 'Chiens au foyer',
		group: 'Foyer',
		compact: 'count',
		accessor: (row) => (row.hasAnimalsAtHome ? (row.numberOfDogsAtHome ?? 0) : 0),
		sortable: true
	},
	{
		id: 'otherAnimals',
		header: 'Autres',
		headerIcon: 'paw',
		title: 'Autres animaux au foyer',
		group: 'Foyer',
		compact: 'other',
		accessor: (row) => (row.hasAnimalsAtHome && row.otherAnimalsAtHome ? 1 : 0),
		sortable: true
	},
	// La recherche « Rechercher un hôte… » trouve toujours « chien », « poules »… (non affichée)
	{
		id: 'animalsText',
		header: 'Animaux',
		hidden: true,
		accessor: animalsSummary
	},

	// --- Capacités ---
	// Les chats qu'elle accepte : adultes, chatons, mère avec ses petits
	{
		id: 'catAdult',
		header: 'Chats',
		title: 'Chats adultes acceptés',
		group: 'Capacités',
		compact: 'count',
		accessor: (row) => row.catAdult ?? 0,
		sortable: true
	},
	{
		id: 'kitten',
		header: 'Chatons',
		title: 'Chatons acceptés',
		group: 'Capacités',
		compact: 'count',
		accessor: (row) => row.kitten ?? 0,
		sortable: true
	},
	{
		id: 'kittyAndKitten',
		header: 'M+P',
		title: 'Accepte une mère avec ses petits',
		group: 'Capacités',
		compact: 'check',
		accessor: (row) => (row.kittyAndKitten ? 1 : 0),
		sortable: true
	},
	{
		id: 'socialize',
		center: true,
		header: 'Socia.',
		title: 'Sociabilisation',
		group: 'Capacités',
		accessor: (row) => row.socialize,
		filter: { type: 'select', options: HOST_SOCIALIZE_OPTIONS }
	},
	{
		id: 'heal',
		center: true,
		header: 'Soins',
		group: 'Capacités',
		accessor: (row) => row.heal,
		filter: { type: 'select', options: HOST_HEAL_OPTIONS }
	},
	{
		id: 'babyFeeding',
		center: true,
		header: 'Biberon.',
		title: 'Biberonnage',
		group: 'Capacités',
		accessor: (row) => row.babyFeeding,
		filter: { type: 'select', options: HOST_BABY_FEEDING_OPTIONS }
	},

	// --- Pratique ---
	{
		id: 'type',
		center: true,
		header: 'Type',
		title: "Type d'accueil",
		group: 'Pratique',
		accessor: (row) => row.type ?? '—',
		filter: { type: 'select', options: HOST_TYPE_OPTIONS }
	},
	{
		id: 'outside',
		center: true,
		header: 'Ext.',
		title: 'Extérieur',
		group: 'Pratique',
		accessor: (row) => row.outside,
		filter: { type: 'boolean' }
	},
	{
		id: 'car',
		center: true,
		header: 'Voiture',
		group: 'Pratique',
		accessor: (row) => row.car,
		filter: { type: 'boolean' }
	},
	{
		id: 'places',
		center: true,
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
