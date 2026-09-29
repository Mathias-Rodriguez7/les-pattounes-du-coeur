import type { HostFull } from '$lib/types/host';
import {
	HOST_ACTIF_OPTIONS,
	HOST_TYPE_OPTIONS,
	HOST_HEAL_OPTIONS,
	HOST_SOCIALIZE_OPTIONS,
	HOST_BABY_FEEDING_OPTIONS
} from '$lib/constants/host';
import { truncate } from '$lib/utils/string';

export type FilterType = 'text' | 'select' | 'boolean';

export type ColumnDef = {
	id: string;
	header: string;
	accessor: (row: HostFull) => any;
	sortable?: boolean;
	filter?: {
		type: FilterType;
		options?: { label: string; value: string }[];
	};
};

export const columns: ColumnDef[] = [
	{
		id: 'name',
		header: 'Nom',
		accessor: (row) => `${truncate(row.profil.firstName, 20)}. ${truncate(row.profil.lastName, 1)}`,
		sortable: true,
		filter: { type: 'text' }
	},
	{
		id: 'city',
		header: 'Ville',
		accessor: (row) => row.profil?.city ?? '—',
		sortable: true,
		filter: { type: 'text' }
	},
	{
		id: 'district',
		header: 'Quartier',
		accessor: (row) => {
			const city = row.profil?.city?.trim().toLowerCase();
			return city === 'montpellier' ? truncate(row.profil?.district ?? '—', 8) : '—';
		},
		filter: { type: 'text' }
	},
	{
		id: 'type',
		header: 'Type',
		accessor: (row) => row.type ?? '—',
		filter: {
			type: 'select',
			options: HOST_TYPE_OPTIONS
		}
	},
	{
		id: 'actif',
		header: 'Statut',
		accessor: (row) => row.actif,
		filter: {
			type: 'select',
			options: HOST_ACTIF_OPTIONS
		}
	},
	{
		id: 'isAvailable',
		header: 'Disponible',
		accessor: (row) => row.isAvailable,
		filter: { type: 'boolean' }
	},
	{
		id: 'outside',
		header: 'Extérieur',
		accessor: (row) => row.outside,
		filter: { type: 'boolean' }
	},
	{
		id: 'car',
		header: 'Voiture',
		accessor: (row) => row.car,
		filter: { type: 'boolean' }
	},
	{
		id: 'isStockFeed',
		header: 'Stock nourriture',
		accessor: (row) => row.isStockFeed,
		filter: { type: 'boolean' }
	},
	{
		id: 'socialize',
		header: 'Sociabilisation',
		accessor: (row) => row.socialize,
		filter: {
			type: 'select',
			options: HOST_SOCIALIZE_OPTIONS
		}
	},
	{
		id: 'heal',
		header: 'Soin',
		accessor: (row) => row.heal,
		filter: {
			type: 'select',
			options: HOST_HEAL_OPTIONS
		}
	},
	{
		id: 'babyFeeding',
		header: 'Alimentation bébés',
		accessor: (row) => row.babyFeeding,
		filter: {
			type: 'select',
			options: HOST_BABY_FEEDING_OPTIONS
		}
	},
	{
		id: 'activePlacements',
		header: 'Chats actuels',
		accessor: (row) => (row.placements ?? []).filter((p) => p.status === 'ACTIVE').length,
		sortable: true
	},
	{
		id: 'space',
		header: 'Espace (m²)',
		accessor: (row) => row.space,
		sortable: true
	}
];
