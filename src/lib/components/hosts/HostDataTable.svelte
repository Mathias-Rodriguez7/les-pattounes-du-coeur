<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import {
		ArrowUp,
		ArrowDown,
		ArrowUpDown,
		Cat,
		Dog,
		PawPrint,
		SlidersHorizontal
	} from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import type { HostFull } from '#lib/types/host.ts';
	import { columns as defaultColumns, type ColumnDef } from './columns';
	import HostPlacementRow from './HostPlacementRow.svelte';
	import HostCompareView from './HostCompareView.svelte';
	import HostPreviewSheet from './HostPreviewSheet.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import InputField from '#lib/components/fields/InputField.svelte';

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

	// Par défaut : les FA actives ET disponibles (deux filtres sans colonne, voir columns.ts)
	const DEFAULT_FILTERS: Record<string, string> = { actif: 'ACTIVE', isAvailable: 'true' };

	// Pas de tri par défaut : l'ordre du serveur
	const DEFAULT_SORT_COLUMN = null;
	const DEFAULT_SORT_DIRECTION: 'asc' | 'desc' = 'asc';

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

	/** Un groupe sur deux sur un fond léger (en-têtes seulement : le corps garde son zébrage) */
	const groupTint = (group: string) =>
		group === 'Foyer' || group === 'Pratique' ? 'bg-muted/60' : '';

	// Les en-têtes en icône (animaux au foyer) : les mêmes couleurs que partout (chat ambre…)
	const HEADER_ICONS = { cat: Cat, dog: Dog, paw: PawPrint };
	const HEADER_ICON_COLORS = {
		cat: 'text-amber-600',
		dog: 'text-sky-600',
		paw: 'text-emerald-600'
	};

	// Les colonnes affichées (une colonne « hidden » ne sert qu'aux filtres)
	const visibleColumns = $derived(columns.filter((c) => !c.hidden));

	// La ligne des sur-titres (Foyer, Capacités, Pratique) : une cellule par suite de colonnes
	// du même groupe. La 1re cellule (vide) couvre la case à cocher, l’œil et le nom.
	const groupHeaders = $derived.by(() => {
		// 3 : la case à cocher, l'œil (aperçu) et le nom
		const cells: { label: string; span: number }[] = [{ label: '', span: 3 }];
		for (const col of visibleColumns.slice(1)) {
			const label = col.group ?? '';
			const last = cells.length > 1 ? cells[cells.length - 1] : null;
			if (last && last.label === label) last.span++;
			else cells.push({ label, span: 1 });
		}
		return cells;
	});

	// Raccourci au-dessus du tableau : « Disponibles seulement » (le filtre « Disponible »)
	const onlyAvailable = $derived(columnFilters.isAvailable === 'true');

	const activeFiltersCount = $derived(Object.values(columnFilters).filter(Boolean).length);

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
			// Les petites colonnes de chiffres : le plus grand d'abord (ex : le plus de chatons)
			sortDirection = columns.find((c) => c.id === colId)?.compact ? 'desc' : 'asc';
		}
	}

	function setColumnFilter(colId: string, value: string) {
		columnFilters = { ...columnFilters, [colId]: value };
	}

	// La comparaison « retournée » : 4 FA au plus, au-delà les colonnes seraient trop étroites
	const MAX_COMPARE = 4;
	const canCompare = $derived(
		internalSelected.length > 0 && internalSelected.length <= MAX_COMPARE
	);
	const comparedHosts = $derived(hosts.filter((h) => internalSelected.includes(h.id)));

	function toggleCompareMode() {
		compareMode = !compareMode;
	}

	// Plus de FA cochée : on revient au tableau
	$effect(() => {
		if (compareMode && internalSelected.length === 0) compareMode = false;
	});

	// L'aperçu d'une FA (clic sur son nom, ou l'œil de la comparaison)
	let previewHost = $state<HostFull | null>(null);

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
			<Button
				class="rounded-2xl"
				variant={onlyAvailable ? 'secondary' : 'outline'}
				size="sm"
				aria-pressed={onlyAvailable}
				onclick={() => setColumnFilter('isAvailable', onlyAvailable ? '' : 'true')}
			>
				Disponibles seulement
			</Button>
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
					disabled={!compareMode && !canCompare}
					title={internalSelected.length > MAX_COMPARE
						? `Comparer ${MAX_COMPARE} FA au plus : décochez-en quelques-unes`
						: undefined}
					onclick={toggleCompareMode}
				>
					{compareMode ? 'Revenir au tableau' : `Comparer (${internalSelected.length})`}
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

	{#if compareMode}
		<!-- Les FA cochées, côte à côte : une colonne par FA, une ligne par information -->
		<HostCompareView
			hosts={comparedHosts}
			onRemove={(hostId) => handleToggle(hostId, false)}
			onPreview={(host) => (previewHost = host)}
		/>
	{:else}
		<!-- Table avec scroll -->
		<div class="mt-2 h-[60dvh] min-h-80 overflow-auto rounded-md lg:h-[calc(100vh-24rem)]">
			<Table.Root containerClass="overflow-visible">
				<Table.Header class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]">
					<!-- Sur-titres -->
					<!-- Sur-titres : centrés sur leur groupe ; Foyer et Pratique sur un fond léger,
				     pour repérer la zone quand on fait défiler vers la droite -->
					<Table.Row class="border-none hover:bg-transparent">
						{#each groupHeaders as cell, i (i)}
							<Table.Head
								colspan={cell.span}
								class="h-7 text-center text-xs font-semibold tracking-wide text-foreground/70 {cell.label
									? 'border-l border-foreground/10'
									: ''} {groupTint(cell.label)}"
							>
								{cell.label}
							</Table.Head>
						{/each}
					</Table.Row>
					<Table.Row class="border-b border-foreground/10 hover:bg-transparent">
						<Table.Head class="w-10"></Table.Head>
						<Table.Head class="w-8 px-0"><span class="sr-only">Voir la fiche</span></Table.Head>
						{#each visibleColumns as col, i (col.id)}
							<Table.Head
								title={col.title}
								class="h-9 text-xs font-medium whitespace-nowrap text-muted-foreground {(col.group &&
									visibleColumns[i - 1]?.group !== col.group) ||
								col.separatorBefore
									? 'border-l border-foreground/10'
									: ''} {col.compact ? 'px-1.5 text-center' : ''} {col.center
									? 'text-center'
									: ''} {groupTint(col.group ?? '')}"
							>
								{#if col.sortable}
									<button
										class="flex items-center gap-1 hover:underline {col.compact || col.center
											? 'mx-auto'
											: ''}"
										onclick={() => toggleSort(col.id)}
										aria-label={col.headerIcon ? `Trier par ${col.title ?? col.header}` : undefined}
									>
										{#if col.headerIcon}
											{@const HeaderIcon = HEADER_ICONS[col.headerIcon]}
											<HeaderIcon class="size-4 {HEADER_ICON_COLORS[col.headerIcon]}" />
										{:else}
											{col.header}
										{/if}
										{#if sortColumn === col.id}
											{#if sortDirection === 'asc'}
												<ArrowUp class="h-3 w-3" />
											{:else}
												<ArrowDown class="h-3 w-3" />
											{/if}
										{:else if !col.compact}
											<!-- Petites colonnes : pas de flèche au repos, pour rester étroites -->
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
								colspan={visibleColumns.length + 2}
								class="py-8 text-center text-muted-foreground"
							>
								Aucun hôte ne correspond à ces critères.
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each sortedHosts as host (host.id)}
							<HostPlacementRow
								{host}
								columns={visibleColumns}
								selected={internalSelected.includes(host.id)}
								onPreview={(h) => (previewHost = h)}
								onToggle={handleToggle}
							/>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>

<HostPreviewSheet
	host={previewHost}
	selected={!!previewHost && internalSelected.includes(previewHost.id)}
	onToggle={handleToggle}
	onClose={() => (previewHost = null)}
/>
