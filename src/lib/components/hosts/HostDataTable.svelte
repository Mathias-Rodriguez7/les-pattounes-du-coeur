<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUp, ArrowDown, ArrowUpDown } from '@lucide/svelte';
	import type { HostFull } from '$lib/types/host';
	import { columns as defaultColumns, type ColumnDef } from './columns';
	import HostPlacementRow from './HostPlacementRow.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import InputField from '$lib/components/fields/InputField.svelte';

	interface Props {
		hosts: HostFull[];
		selectedHostIds?: string[];
		onSelectionChange?: (hostIds: string[]) => void;
		columns?: ColumnDef[];
	}

	let {
		hosts,
		selectedHostIds = [],
		onSelectionChange,
		columns = defaultColumns
	}: Props = $props();

	const DEFAULT_FILTERS: Record<string, string> = { actif: 'ACTIVE' };

	// --- État global ---
	let globalFilter = $state('');
	let columnFilters = $state<Record<string, string>>({ ...DEFAULT_FILTERS });
	let sortColumn = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let internalSelected = $state<string[]>(selectedHostIds);
	let compareMode = $state(false);

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
	}

	function toggleCompareMode() {
		compareMode = !compareMode;
	}

	// --- Filtrage ---
	const filteredHosts = $derived.by(() => {
		let result = hosts;

		if (compareMode) {
			result = result.filter((h) => internalSelected.includes(h.id));
		}

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

	function resetFilters() {
		globalFilter = '';
		columnFilters = { ...DEFAULT_FILTERS };
	}
</script>

<div class="space-y-3">
	<!-- Filtres par colonne -->
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-wrap gap-2">
			{#each columns.filter((c) => c.filter) as col (col.id)}
				{#if col.filter?.type === 'select'}
					<div class="w-20">
						<SelectField
							id={`filter-${col.id}`}
							label={col.header}
							bind:value={() => columnFilters[col.id] ?? '', (v) => setColumnFilter(col.id, v)}
							options={[ALL_OPTION, ...(col.filter.options ?? [])]}
							size="sm"
						/>
					</div>
				{:else if col.filter?.type === 'boolean'}
					<div class="w-20">
						<SelectField
							id={`filter-${col.id}`}
							label={col.header}
							bind:value={() => columnFilters[col.id] ?? '', (v) => setColumnFilter(col.id, v)}
							options={BOOLEAN_OPTIONS}
							size="sm"
						/>
					</div>
				{:else if col.filter?.type === 'text'}
					<div class="w-25">
						<InputField
							id={`filter-${col.id}`}
							label={col.header}
							type="text"
							placeholder={col.header}
							bind:value={columnFilters[col.id]}
							size="sm"
						/>
					</div>
				{/if}
			{/each}
		</div>
		<!-- Barre de recherche globale -->
		<div class="mt-4 flex flex-col items-center gap-2">
			<InputField
				type="text"
				placeholder="Rechercher un hôte…"
				bind:value={globalFilter}
				size="sm"
			/>

			<div class="flex gap-2">
				<Button size="sm" onclick={resetFilters}>Réinitialiser</Button>
				<Button
					variant={compareMode ? 'default' : 'outline'}
					size="sm"
					disabled={internalSelected.length === 0 && !compareMode}
					onclick={toggleCompareMode}
				>
					{compareMode ? 'Afficher tout' : `Comparer (${internalSelected.length})`}
				</Button>
			</div>
		</div>
	</div>

	<!-- Table avec scroll -->
	<div class="max-h-120 overflow-x-auto overflow-y-auto rounded-md">
		<Table.Root>
			<Table.Header class="bg-background sticky top-0 z-10">
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
				{#if sortedHosts.length === 0}
					<Table.Row>
						<Table.Cell colspan={columns.length + 1} class="text-muted-foreground py-8 text-center">
							Aucun hôte ne correspond à ces critères.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each sortedHosts as host (host.id)}
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
</div>
