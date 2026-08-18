<script lang="ts">
	import DataTable from '$lib/components/table/DataTable.svelte';
	import { Check, X, AlertCircle, Plus } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		cats: any[];
		onNewCat: () => void;
		onSelectCat: (id: string) => void;
		selectedCatId: string | null;
	}

	const { cats, onNewCat, onSelectCat, selectedCatId = null } = $props();

	const tabs = [
		{ value: 'all', label: 'Tout' },
		{ value: 'with_fa', label: 'Avec FA' },
		{ value: 'without_fa', label: 'Sans FA' },
		{ value: 'adopted', label: 'Adoptés' }
	];

	function filterCats(data: any[], tab: string) {
		switch (tab) {
			case 'with_fa':
				return data.filter((c) => c.currentHost !== null);
			case 'without_fa':
				return data.filter((c) => c.currentHost === null && c.status !== 'ADOPTED');
			case 'adopted':
				return data.filter((c) => c.status === 'ADOPTED');
			default:
				return data;
		}
	}

	function formatAge(birthDate: string | Date): string {
		const birth = new Date(birthDate);
		const today = new Date();

		let years = today.getFullYear() - birth.getFullYear();
		let months = today.getMonth() - birth.getMonth();

		if (months < 0) {
			years--;
			months += 12;
		}

		if (years > 0) {
			return `${years}a ${months}m`;
		}
		return `${months}m`;
	}

	function getStatusStyle(status: string) {
		switch (status) {
			case 'ADOPTED':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'IN_CARE':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'AVAILABLE':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
			case 'SICK':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	const statusLabels: Record<string, string> = {
		ADOPTED: 'Adopté',
		IN_CARE: 'En gestion',
		AVAILABLE: 'Disponible',
		SICK: 'Malade'
	};

	const CompatIcon = (compatible: boolean | null) => {
		if (compatible === null || compatible === undefined) {
			return AlertCircle;
		}
		return compatible ? Check : X;
	};

	const columns = [
		{
			key: 'photo',
			label: 'Photo',
			render: (_, row) => row.photos?.[0]?.url ?? '',
			class: 'w-12'
		},
		{
			key: 'name',
			label: 'Nom',
			class: 'font-medium'
		},
		{
			key: 'sex',
			label: 'Sexe',
			render: (value) => (value === 'MALE' ? '♂️ Mâle' : '♀️ Femelle')
		},
		{
			key: 'birthDate',
			label: 'Âge',
			render: (value) => formatAge(value)
		},
		{
			key: 'status',
			label: 'Statut',
			render: (value) => statusLabels[value] || value,
			class: 'text-center'
		},
		{
			key: 'compatibleWithDogs',
			label: 'Chiens',
			class: 'text-center w-12'
		},
		{
			key: 'compatibleWithCats',
			label: 'Chats',
			class: 'text-center w-12'
		},
		{
			key: 'compatibleWithChildren',
			label: 'Enfants',
			class: 'text-center w-12'
		},
		{
			key: 'needsGarden',
			label: 'Jardin',
			class: 'text-center w-12'
		}
	];
</script>

<DataTable
	title="Chats en gestion"
	data={cats}
	{columns}
	{tabs}
	filterFn={filterCats}
	onRowClick={(row) => onSelectCat(row.id)}
	{selectedCatId}
	primaryKey="id"
	pageSize={10}
	actionButton={{
		label: 'Nouveau chat',
		icon: Plus,
		onClick: onNewCat
	}}
/>
