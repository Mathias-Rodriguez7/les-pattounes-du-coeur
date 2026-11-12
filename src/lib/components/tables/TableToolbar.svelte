<!-- src/lib/components/tables/TableToolbar.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Search, SlidersHorizontal } from '@lucide/svelte';
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
	}

	let {
		search = $bindable(''),
		searchPlaceholder = 'Rechercher…',
		searchLabel,
		showSearch = true,
		onReset,
		filters,
		actions
	}: Props = $props();

	const uid = $props.id();
	const panelId = `table-filters-${uid}`;

	let open = $state(false);
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
			</Button>
		{/if}

		{#if showSearch}
			<div class="relative min-w-40 flex-1">
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
</div>
