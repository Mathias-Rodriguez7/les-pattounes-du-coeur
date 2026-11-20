<script lang="ts">
	import { getAgeBadge } from '#lib/utils/age.ts';
	import { CAT_AGE } from '#lib/constants/cat.ts';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import * as Dialog from '#lib/components/ui/dialog/index.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import CatCard from '#lib/components/cats/CatCard.svelte';
	import CatDialog from '#lib/components/cats/CatDialog.svelte';
	import type { CatPublic } from '#lib/types/cat.ts';
	import { fade, fly } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedCat = $state<CatPublic | null>(null);
	let isOpen = $state(false);

	function openCat(cat: CatPublic) {
		selectedCat = cat;
		isOpen = true;
	}

	// ===== FILTRES : le même système que les tableaux du dashboard (valeur '' = pas de filtre) =====
	let search = $state('');
	// Les valeurs de l'âge sont celles du badge des cartes (getAgeBadge) : filtre et badge disent pareil
	let ageFilter = $state('');
	let sexFilter = $state('');
	const SEX_OPTIONS = [
		{ value: 'MALE', label: 'Mâle' },
		{ value: 'FEMALE', label: 'Femelle' }
	];
	// Les compatibilités : des boutons à activer (on ne cherche que les chats compatibles)
	const COMPAT = [
		{ key: 'okChild', label: 'Ok enfants' },
		{ key: 'okDog', label: 'Ok chiens' },
		{ key: 'okCat', label: 'Ok chats' },
		{ key: 'garden', label: 'Avec extérieur' }
	] as const;
	type CompatKey = (typeof COMPAT)[number]['key'];
	let compat = $state<Record<CompatKey, boolean>>({
		okChild: false,
		okDog: false,
		okCat: false,
		garden: false
	});

	function resetFilters() {
		search = '';
		ageFilter = '';
		sexFilter = '';
		compat = { okChild: false, okDog: false, okCat: false, garden: false };
	}

	function matches(cat: CatPublic) {
		const query = search.trim().toLowerCase();
		if (query && !(cat.name ?? '').toLowerCase().includes(query)) return false;
		if (ageFilter && getAgeBadge(cat.birthDate) !== ageFilter) return false;
		if (sexFilter && cat.sex !== sexFilter) return false;
		if (compat.okChild && !cat.isOkChild) return false;
		if (compat.okDog && !cat.isOkDog) return false;
		if (compat.okCat && !cat.isOkCat) return false;
		if (compat.garden && !cat.isOutside) return false;
		return true;
	}

	const filteredCats = $derived(data.cats.filter(matches));

	// Combien de filtres jouent (la recherche à part) : la pastille du bouton « Filtres »
	const activeCount = $derived(
		(ageFilter ? 1 : 0) + (sexFilter ? 1 : 0) + Object.values(compat).filter(Boolean).length
	);

	// -----------------------------
	// EFFECT (deep link)
	// -----------------------------
	$effect(() => {
		if (!data.selectedCatId) return;

		const cat = data.cats.find((c) => c.id === data.selectedCatId);

		if (cat) {
			selectedCat = cat;
			isOpen = true;
		}
	});
</script>

<svelte:head>
	<title>Chats à adopter – Les Pattounes du Cœur</title>
	<meta
		name="description"
		content="Les chats de l'association Les Pattounes du Cœur qui attendent une famille, à Montpellier et alentours."
	/>
</svelte:head>

<main in:fade={{ duration: 200 }} class="flex justify-center p-4">
	<div in:fly={{ y: 20, duration: 300 }} class="flex w-full flex-col gap-6 p-8">
		<h1 class="text-2xl font-bold">Ils attendent leur famille</h1>

		<!-- Recherche + bouton Filtres : comme dans les tableaux du dashboard -->
		<div class="rounded-3xl bg-card p-4 shadow-sm">
			<TableToolbar
				bind:search
				searchPlaceholder="Rechercher par nom…"
				searchLabel="Rechercher un chat par son nom"
				onReset={resetFilters}
				searchClass="w-full sm:ml-auto sm:w-72"
				{activeCount}
			>
				{#snippet filters()}
					<SelectField
						id="adopt-filter-age"
						label=""
						options={CAT_AGE}
						bind:value={ageFilter}
						placeholder="Âge"
						class="w-full sm:w-44"
					/>
					<SelectField
						id="adopt-filter-sex"
						label=""
						options={SEX_OPTIONS}
						bind:value={sexFilter}
						placeholder="Sexe"
						class="w-full sm:w-32"
					/>
					{#each COMPAT as item (item.key)}
						<Button
							size="sm"
							variant={compat[item.key] ? 'default' : 'outline'}
							class="rounded-2xl"
							aria-pressed={compat[item.key]}
							onclick={() => (compat[item.key] = !compat[item.key])}
						>
							{item.label}
						</Button>
					{/each}
				{/snippet}
			</TableToolbar>
		</div>

		<!-- Le nombre de chats affichés, annoncé aux lecteurs d'écran quand il change -->
		<p class="-mt-2 text-sm text-muted-foreground" aria-live="polite">
			{#if activeCount === 0 && !search.trim()}
				{filteredCats.length}
				{filteredCats.length > 1 ? 'chats attendent' : 'chat attend'} une famille
			{:else}
				{filteredCats.length}
				{filteredCats.length > 1 ? 'chats correspondent' : 'chat correspond'} à vos critères
			{/if}
		</p>

		<!-- GRID -->
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredCats as cat (cat.id)}
				<button type="button" class="w-full text-left" onclick={() => openCat(cat)}>
					<CatCard {cat} />
				</button>
			{:else}
				<div
					class="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center"
				>
					<img src="/img/3.cats.jpg" alt="" class="h-40" />
					<h2 class="text-xl font-semibold">Aucun chat trouvé</h2>
					<p class="text-muted-foreground text-sm">
						Essayez de modifier ou de réinitialiser vos filtres.
					</p>
					<button
						type="button"
						onclick={resetFilters}
						class="text-primary text-sm underline underline-offset-4 hover:opacity-70 transition-opacity"
					>
						Réinitialiser les filtres
					</button>
				</div>
			{/each}
		</section>

		<!-- DIALOG -->
		<Dialog.Root
			bind:open={isOpen}
			onOpenChange={(v) => {
				isOpen = v;

				if (!v) {
					selectedCat = null;
					replaceState(resolve('adoptions/chat'), {});
				}
			}}
		>
			<CatDialog {selectedCat} />
		</Dialog.Root>
	</div>
</main>
