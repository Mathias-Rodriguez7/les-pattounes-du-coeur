<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import CatCard from '$lib/components/CatCard.svelte';
	import CatDialog from '$lib/components/CatDialog.svelte';
	import type { Cat } from '$lib/types/cat';
	import { fade, fly } from 'svelte/transition';

	type PageData = {
		cats: Cat[];
		selectedCatId?: string | null;
	};

	let { data }: { data: PageData } = $props();

	// -----------------------------
	// STATE
	// -----------------------------
	let selectedCat = $state<Cat | null>(null);
	let isOpen = $state(false);

	type AgeFilter = 'ALL' | 'CHATON' | 'ADULT' | 'SENIOR' | 'SUPER SENIOR';
	type SexFilter = 'ALL' | 'MALE' | 'FEMALE';

	type CatFilters = {
		search: string;

		okDog: boolean | null;
		okCat: boolean | null;
		okChild: boolean | null;

		age: AgeFilter;
		sex: SexFilter;

		garden: boolean | null;
	};

	let filters = $state<CatFilters>({
		search: '',

		okDog: null,
		okCat: null,
		okChild: null,

		age: 'ALL',
		sex: 'ALL',

		garden: null
	});

	// -----------------------------
	// ACTIONS
	// -----------------------------
	function openCat(cat: Cat) {
		selectedCat = cat;
		isOpen = true;
	}

	function resetFilters() {
		filters = {
			search: '',

			okDog: null,
			okCat: null,
			okChild: null,

			age: 'ALL',
			sex: 'ALL',

			garden: null
		};
	}

	// -----------------------------
	// FILTER LOGIC
	// -----------------------------
	function matches(cat: Cat) {
		// SEARCH
		if (filters.search && !cat.name?.toLowerCase().includes(filters.search.toLowerCase())) {
			return false;
		}

		// COMPATIBILITÉS
		if (filters.okDog !== null && cat.isOkDog !== filters.okDog) return false;
		if (filters.okCat !== null && cat.isOkCat !== filters.okCat) return false;
		if (filters.okChild !== null && cat.isOkChild !== filters.okChild) return false;

		// SEXE
		if (filters.sex !== 'ALL' && cat.sex !== filters.sex) return false;

		// JARDIN
		if (filters.garden !== null && cat.isOutside !== filters.garden) return false;

		// AGE
		if (filters.age !== 'ALL') {
			if (filters.age === 'CHATON' && cat.age >= 1) return false;
			if (filters.age === 'ADULT' && (cat.age <= 1 || cat.age > 7)) return false;
			if (filters.age === 'SENIOR' && (cat.age <= 7 || cat.age > 10)) return false;
			if (filters.age === 'SUPER SENIOR' && cat.age <= 10) return false;
		}

		return true;
	}

	let filteredCats = $derived(data.cats.filter(matches));

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

<main in:fade={{ duration: 200 }} class="flex justify-center p-4">
	<div in:fly={{ y: 20, duration: 300 }} class="max-w-10xl flex w-full flex-col gap-6 p-8">
		<h1 class="text-2xl font-bold">Ils attendent leur famille</h1>

		<!-- FILTER BAR -->
		<div
			class="bg-primary-foreground flex flex-wrap items-center justify-between gap-4 rounded-4xl px-6 py-4"
		>
			<!-- FILTER BUTTON -->
			<Sheet.Root>
				<Sheet.Trigger>
					<Button>Filtres</Button>
				</Sheet.Trigger>

				<Sheet.Content side="left" class="w-96 space-y-6">
					<h2 class="text-xl font-bold">Filtres</h2>

					<label class="flex items-center justify-between">
						<span>OK chien</span>
						<input type="checkbox" bind:checked={filters.okDog} />
					</label>

					<label class="flex items-center justify-between">
						<span>OK chat</span>
						<input type="checkbox" bind:checked={filters.okCat} />
					</label>

					<label class="flex items-center justify-between">
						<span>OK enfant</span>
						<input type="checkbox" bind:checked={filters.okChild} />
					</label>

					<div>
						<p>Sexe</p>
						<select bind:value={filters.sex} class="w-full">
							<option value="ALL">Tous</option>
							<option value="MALE">Mâle</option>
							<option value="FEMALE">Femelle</option>
						</select>
					</div>

					<div>
						<p>Âge</p>
						<select bind:value={filters.age} class="w-full">
							<option value="ALL">Tous</option>
							<option value="CHATON">Chaton</option>
							<option value="ADULT">Adulte</option>
							<option value="SENIOR">Senior</option>
							<option value="SUPER SENIOR">Super Senior</option>
						</select>
					</div>

					<label class="flex items-center justify-between">
						<span>Besoin jardin</span>
						<input type="checkbox" bind:checked={filters.garden} />
					</label>

					<Button variant="outline" onclick={resetFilters}>Réinitialiser</Button>
				</Sheet.Content>
			</Sheet.Root>

			<!-- SEARCH -->
			<div class="flex items-center gap-2">
				<Search />
				<Input type="text" placeholder="Rechercher..." bind:value={filters.search} />
			</div>
		</div>

		<!-- GRID -->
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredCats as cat (cat.id)}
				<button type="button" class="w-full text-left" onclick={() => openCat(cat)}>
					<CatCard {cat} />
				</button>
			{/each}
		</section>

		<!-- DIALOG -->
		<Dialog.Root
			bind:open={isOpen}
			onOpenChange={(v) => {
				isOpen = v;

				if (!v) {
					selectedCat = null;
					history.replaceState({}, '', '/adoptions/chat');
				}
			}}
		>
			<CatDialog {selectedCat} />
		</Dialog.Root>
	</div>
</main>
