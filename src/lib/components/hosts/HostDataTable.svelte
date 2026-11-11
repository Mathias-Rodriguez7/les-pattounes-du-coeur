<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { ArrowUp, ArrowDown, ArrowUpDown, SlidersHorizontal, Sparkles } from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import type { HostFull } from '#lib/types/host.ts';
	import type { CatFull } from '#lib/types/cat.ts';
	import { columns as defaultColumns, type ColumnDef } from './columns';
	import { getHostCompatibility } from '#lib/utils/compatibility.ts';
	import HostPlacementRow from './HostPlacementRow.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';

	interface Props {
		hosts: HostFull[];
		cat?: CatFull;
		selectedHostIds?: string[];
		onSelectionChange?: (hostIds: string[]) => void;
		columns?: ColumnDef[];
	}

	let {
		hosts,
		cat,
		selectedHostIds = [],
		onSelectionChange,
		columns = defaultColumns
	}: Props = $props();

	const DEFAULT_FILTERS: Record<string, string> = { actif: 'ACTIVE' };

	// Valeurs initiales voulues : la Dialog recrée le tableau à chaque ouverture,
	// donc `cat` ne change pas pendant que le tableau est affiché.
	// svelte-ignore state_referenced_locally
	const DEFAULT_SORT_COLUMN = cat ? 'compatibility' : null;
	// svelte-ignore state_referenced_locally
	const DEFAULT_SORT_DIRECTION: 'asc' | 'desc' = cat ? 'desc' : 'asc';

	// --- État global ---
	let globalFilter = $state('');
	let columnFilters = $state<Record<string, string>>({ ...DEFAULT_FILTERS });
	let sortColumn = $state<string | null>(DEFAULT_SORT_COLUMN);
	let sortDirection = $state<'asc' | 'desc'>(DEFAULT_SORT_DIRECTION);
	// Sélection de départ seulement : ensuite, le tableau gère la sienne
	// svelte-ignore state_referenced_locally
	let internalSelected = $state<string[]>(selectedHostIds);
	let compareMode = $state(false);
	let showFilters = $state(false);

	const ALL_OPTION = { value: '', label: 'Tous' };
	const BOOLEAN_OPTIONS = [
		{ value: '', label: 'Tous' },
		{ value: 'true', label: 'Oui' },
		{ value: 'false', label: 'Non' }
	];

	// --- Compatibilité : calculée une fois par FA ---
	const compatibilityById = $derived(
		cat ? new Map(hosts.map((h) => [h.id, getHostCompatibility(h, cat)])) : null
	);

	// Colonne "Compat." insérée juste après "Nom"
	const allColumns = $derived<ColumnDef[]>(
		compatibilityById
			? columns.flatMap((col) =>
					col.id === 'name'
						? [
								col,
								{
									id: 'compatibility',
									header: 'Compat.',
									accessor: (row: HostFull) => compatibilityById?.get(row.id)?.score ?? 0,
									sortable: true,
									mobile: true
								}
							]
						: [col]
				)
			: columns
	);

	const activeFiltersCount = $derived(Object.values(columnFilters).filter(Boolean).length);
	const isSortedByCompatibility = $derived(!!cat && sortColumn === 'compatibility');

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
			sortDirection = colId === 'compatibility' ? 'desc' : 'asc';
		}
	}

	function sortByCompatibility() {
		sortColumn = 'compatibility';
		sortDirection = 'desc';
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
				allColumns.some((col) =>
					String(col.accessor(host) ?? '')
						.toLowerCase()
						.includes(q)
				)
			);
		}

		for (const [colId, value] of Object.entries(columnFilters)) {
			if (!value) continue;
			const col = allColumns.find((c) => c.id === colId);
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
		const col = allColumns.find((c) => c.id === sortColumn);
		if (!col) return filteredHosts;

		return [...filteredHosts].sort((a, b) => {
			const va = col.accessor(a);
			const vb = col.accessor(b);
			const cmp =
				typeof va === 'number' && typeof vb === 'number'
					? va - vb
					: String(va ?? '').localeCompare(String(vb ?? ''));
			return sortDirection === 'asc' ? cmp : -cmp;
		});
	});

	function resetFilters() {
		globalFilter = '';
		columnFilters = { ...DEFAULT_FILTERS };
		sortColumn = DEFAULT_SORT_COLUMN;
		sortDirection = DEFAULT_SORT_DIRECTION;
	}
</script>

{#snippet filtersButton(classList: string)}
	<Button
		class="rounded-2xl {classList}"
		variant={showFilters ? 'default' : 'outline'}
		size="sm"
		aria-expanded={showFilters}
		onclick={() => (showFilters = !showFilters)}
	>
		<SlidersHorizontal class="h-4 w-4" />
		Filtres{activeFiltersCount ? ` (${activeFiltersCount})` : ''}
	</Button>
{/snippet}

<div class="space-y-3">
	<!-- Barre d'outils -->
	<div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex gap-4">
			{@render filtersButton('hidden lg:inline-flex')}

			<!-- Message de tri -->
			<div class="flex min-h-8 items-center gap-2 text-sm text-muted-foreground">
				{#if isSortedByCompatibility}
					<Sparkles class="h-4 w-4 shrink-0 text-amber-500" />
					<span>
						Trié par compatibilité avec <strong class="text-foreground"
							>{cat?.name ?? 'ce chat'}</strong
						>
						: les FA les plus adaptées sont en haut.
					</span>
				{:else if cat}
					<button
						type="button"
						class="flex items-center gap-1 underline-offset-2 hover:underline"
						onclick={sortByCompatibility}
					>
						<Sparkles class="h-4 w-4 shrink-0" />
						Revenir au tri par compatibilité
					</button>
				{/if}
			</div>
		</div>

		<!-- Recherche + boutons -->
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
			<InputField
				type="text"
				placeholder="Rechercher un hôte…"
				bind:value={globalFilter}
				size="sm"
			/>

			<div class="flex flex-wrap gap-2">
				{@render filtersButton('lg:hidden')}
				<Button class="rounded-2xl" size="sm" onclick={resetFilters}>Réinitialiser</Button>
				<Button
					class="rounded-2xl"
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

	<!-- Filtres par colonne (repliés par défaut) -->
	{#if showFilters}
		<div transition:slide={{ duration: 150 }} class="flex flex-wrap gap-2 p-3">
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
	{/if}

	<!-- Table avec scroll -->
	<div class="mt-2 h-[60dvh] min-h-80 overflow-auto rounded-md lg:h-[calc(100vh-24rem)]">
		<Table.Root containerClass="overflow-visible">
			<Table.Header class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]">
				<Table.Row>
					<Table.Head class="w-10"></Table.Head>
					{#each allColumns as col (col.id)}
						<Table.Head class={col.mobile ? '' : 'hidden lg:table-cell'}>
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
						<Table.Cell
							colspan={allColumns.length + 1}
							class="py-8 text-center text-muted-foreground"
						>
							Aucun hôte ne correspond à ces critères.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each sortedHosts as host (host.id)}
						<HostPlacementRow
							{host}
							columns={allColumns}
							compatibility={compatibilityById?.get(host.id)}
							selected={internalSelected.includes(host.id)}
							onToggle={handleToggle}
						/>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
