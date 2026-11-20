<!-- src/lib/components/tables/TableToolbar.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Search, SlidersHorizontal, X } from '@lucide/svelte';
	import type { FilterChip } from '#lib/tables/filterChips.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Input } from '#lib/components/ui/input/index.ts';

	interface Props {
		/** Le texte recherché (bind:search) */
		search?: string;
		searchPlaceholder?: string;
		/** Pour les lecteurs d'écran : par défaut, le placeholder */
		searchLabel?: string;
		/** false : pas de champ de recherche (page sans recherche) */
		showSearch?: boolean;
		/** Bouton « Réinitialiser » du panneau de filtres */
		onReset?: () => void;
		/** Les champs de filtre (SelectField…). Absent : pas de bouton « Filtres » (recherche seule) */
		filters?: Snippet;
		/** Boutons en plus, à droite de la recherche (facultatif) */
		actions?: Snippet;
		/** Taille et place du champ de recherche (par défaut : il prend toute la largeur libre) */
		searchClass?: string;
		/**
		 * Nombre de filtres actifs : une pastille sur « Filtres » (on voit qu'un filtre joue, même replié).
		 * Par défaut : le nombre de puces
		 */
		activeCount?: number;
		/** Les filtres actifs, en puces sous la barre (visibles même panneau replié), chacune avec × */
		chips?: FilterChip[];
	}

	let {
		search = $bindable(''),
		searchPlaceholder = 'Rechercher…',
		searchLabel,
		showSearch = true,
		onReset,
		filters,
		actions,
		activeCount,
		chips = [],
		searchClass = 'min-w-40 flex-1'
	}: Props = $props();

	const uid = $props.id();
	const panelId = `table-filters-${uid}`;

	let open = $state(false);
	const count = $derived(activeCount ?? chips.length);
</script>

<div class="flex flex-col gap-2">
	<!-- ===== BARRE : Filtres + recherche + actions ===== -->
	<div class="flex flex-wrap items-center gap-2">
		{#if filters}
			<Button
				variant={open ? 'default' : 'outline'}
				size="sm"
				class="h-9 shrink-0 rounded-2xl"
				aria-expanded={open}
				aria-controls={panelId}
				onclick={() => (open = !open)}
			>
				<SlidersHorizontal class="size-4" />
				Filtres
				{#if count > 0}
					<span
						class="rounded-full px-1.5 text-xs font-bold {open
							? 'bg-primary-foreground text-primary'
							: 'bg-primary text-primary-foreground'}"
					>
						{count}
					</span>
					<span class="sr-only">({count} actif{count > 1 ? 's' : ''})</span>
				{/if}
			</Button>
		{/if}

		{#if showSearch}
			<div class="relative {searchClass}">
				<Search
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					bind:value={search}
					placeholder={searchPlaceholder}
					aria-label={searchLabel ?? searchPlaceholder}
					class="pl-9"
				/>
			</div>
		{/if}

		{@render actions?.()}
	</div>

	<!-- ===== FILTRES (repliés par défaut) ===== -->
	{#if open && filters}
		<div
			id={panelId}
			transition:slide={{ duration: 150 }}
			class="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-3"
		>
			{@render filters()}
			{#if onReset}
				<Button size="sm" class="rounded-2xl" onclick={onReset}>Réinitialiser</Button>
			{/if}
		</div>
	{/if}

	<!-- ===== PUCES DES FILTRES ACTIFS (toujours visibles) ===== -->
	{#if chips.length > 0}
		<ul class="flex flex-wrap items-center gap-1.5" aria-label="Filtres actifs">
			{#each chips as chip, i (`${i}-${chip.label}`)}
				<li>
					<button
						type="button"
						onclick={chip.clear}
						class="flex items-center gap-1 rounded-full bg-primary/10 py-1 pr-1.5 pl-2.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/20"
						aria-label="Retirer le filtre {chip.label}"
					>
						{chip.label}
						<X class="size-3.5" aria-hidden="true" />
					</button>
				</li>
			{/each}
			{#if onReset && chips.length > 1}
				<li>
					<button
						type="button"
						onclick={onReset}
						class="px-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
					>
						Réinitialiser
					</button>
				</li>
			{/if}
		</ul>
	{/if}
</div>
