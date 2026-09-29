<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUp, ArrowDown, ArrowUpDown } from '@lucide/svelte';
	import type { HostFull } from '$lib/types/host';
	import { columns as defaultColumns, type ColumnDef } from './columns';
	import HostPlacementRow from './HostPlacementRow.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';

	interface Props {
		hosts: HostFull[];
		selectedHostIds?: string[];
		onSelectionChange?: (hostIds: string[]) => void;
		columns?: ColumnDef[];
		pageSize?: number;
	}

	let {
		hosts,
		selectedHostIds = [],
		onSelectionChange,
		columns = defaultColumns,
		pageSize = 8
	}: Props = $props();

	// --- État global ---
	let globalFilter = $state('');
	let columnFilters = $state<Record<string, string>>({});
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let currentPage = $state(1);
	let internalSelected = $state<string[]>(selectedHostIds);

	const ALL_OPTION = { value: '', label: 'Tous' };
	const BOOLEAN_OPTIONS = [
		{ value: '', label: 'Tous' },
		{ value: 'true', label: 'Oui' },
		{ value: 'false', label: 'Non' }
	];

	function handleToggle(hostId: string, checked: boolean) {
		if (checked) {
			internalSelected = [...internalSelected, hostId];
		} else {
			internalSelected = internalSelected.filter((id) => id !== hostId);
		}
		onSelectionChange?.(internalSelected);
	}

	function toggleSort(colId: string) {
		if (sortColumn === colId) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = colId;
			sortDirection = 'asc';
		}
	}

	function setColumnFilter(colId: string, value: string) {
		columnFilters = { ...columnFilters, [colId]: value };
		currentPage = 1;
	}

	// --- Filtrage ---
	const filteredHosts = $derived.by(() => {
		let result = hosts;

		if (globalFilter.trim()) {
			const q = globalFilter.trim().toLowerCase();
			result = result.filter((host) =>
				columns.some((col) =>
					String(col.accessor(host) ?? '')
						.toLowerCase()
						.includes(q)
				)
			);
		}

		for (const [colId, value] of Object.entries(columnFilters)) {
			if (!value) continue;
			const col = columns.find((c) => c.id === colId);
			if (!col) continue;

			result = result.filter((host) => {
				const cellValue = col.accessor(host);
				if (col.filter?.type === 'boolean') {
					return String(cellValue) === value;
				}
				if (col.filter?.type === 'select') {
					return cellValue === value;
				}
				return String(cellValue ?? '')
					.toLowerCase()
					.includes(value.toLowerCase());
			});
		}

		return result;
	});

	// --- Tri ---
	const sortedHosts = $derived.by(() => {
		if (!sortColumn) return filteredHosts;
		const col = columns.find((c) => c.id === sortColumn);
		if (!col) return filteredHosts;

		return [...filteredHosts].sort((a, b) => {
			const va = col.accessor(a);
			const vb = col.accessor(b);
			let cmp = 0;
			if (typeof va === 'number' && typeof vb === 'number') {
				cmp = va - vb;
			} else {
				cmp = String(va ?? '').localeCompare(String(vb ?? ''));
			}
			return sortDirection === 'asc' ? cmp : -cmp;
		});
	});

	// --- Pagination ---
	const totalPages = $derived(Math.max(1, Math.ceil(sortedHosts.length / pageSize)));

	const paginatedHosts = $derived.by(() => {
		const start = (currentPage - 1) * pageSize;
		return sortedHosts.slice(start, start + pageSize);
	});

	$effect(() => {
		if (currentPage > totalPages) currentPage = 1;
	});

	function resetFilters() {
		globalFilter = '';
		columnFilters = {};
		currentPage = 1;
	}
</script>

<div class="space-y-3">
	<!-- Barre de recherche globale -->
	<div class="flex items-center gap-2">
		<Input
			type="text"
			placeholder="Rechercher un hôte…"
			bind:value={globalFilter}
			class="max-w-sm"
		/>
		<Button variant="ghost" size="sm" onclick={resetFilters}>Réinitialiser</Button>
		<span class="text-muted-foreground ml-auto text-sm">
			{sortedHosts.length} résultat{sortedHosts.length > 1 ? 's' : ''}
			{#if internalSelected.length > 0}
				· {internalSelected.length} sélectionné{internalSelected.length > 1 ? 's' : ''}
			{/if}
		</span>
	</div>

	<!-- Filtres par colonne -->
	<div class="flex flex-wrap items-end gap-2">
		{#each columns.filter((c) => c.filter) as col (col.id)}
			{#if col.filter?.type === 'select'}
				<div class="w-[160px]">
					<SelectField
						id={`filter-${col.id}`}
						label={col.header}
						bind:value={() => columnFilters[col.id] ?? '', (v) => setColumnFilter(col.id, v)}
						options={[ALL_OPTION, ...(col.filter.options ?? [])]}
						size="sm"
					/>
				</div>
			{:else if col.filter?.type === 'boolean'}
				<div class="w-[140px]">
					<SelectField
						id={`filter-${col.id}`}
						label={col.header}
						bind:value={() => columnFilters[col.id] ?? '', (v) => setColumnFilter(col.id, v)}
						options={BOOLEAN_OPTIONS}
						size="sm"
					/>
				</div>
			{:else if col.filter?.type === 'text'}
				<div class="w-[140px] space-y-2">
					<label class="text-xs font-medium text-gray-700" for={`filter-${col.id}`}>
						{col.header}
					</label>
					<Input
						id={`filter-${col.id}`}
						type="text"
						placeholder={col.header}
						value={columnFilters[col.id] ?? ''}
						oninput={(e) => setColumnFilter(col.id, e.currentTarget.value)}
					/>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Table -->
	<div class="overflow-x-auto rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-10"></Table.Head>
					{#each columns as col (col.id)}
						<Table.Head>
							{#if col.sortable}
								<button
									class="flex items-center gap-1 hover:underline"
									onclick={() => toggleSort(col.id)}
								>
									{col.header}
									{#if sortColumn === col.id}
										{#if sortDirection === 'asc'}
											<ArrowUp class="h-3 w-3" />
										{:else}
											<ArrowDown class="h-3 w-3" />
										{/if}
									{:else}
										<ArrowUpDown class="h-3 w-3 opacity-40" />
									{/if}
								</button>
							{:else}
								{col.header}
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if paginatedHosts.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length + 1} class="text-muted-foreground py-8 text-center">
							Aucun hôte ne correspond à ces critères.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each paginatedHosts as host (host.id)}
						<HostPlacementRow
							{host}
							{columns}
							selected={internalSelected.includes(host.id)}
							onToggle={handleToggle}
						/>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex items-center justify-between">
			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === 1}
				onclick={() => (currentPage -= 1)}
			>
				Précédent
			</Button>
			<span class="text-muted-foreground text-sm">
				Page {currentPage} / {totalPages}
			</span>
			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === totalPages}
				onclick={() => (currentPage += 1)}
			>
				Suivant
			</Button>
		</div>
	{/if}
</div>
