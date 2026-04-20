<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import CatCard from '$lib/components/CatCard.svelte';
	import CatDialog from '$lib/components/CatDialog.svelte';
	import type { Cat } from '$lib/types/cat';

	type PageData = {
		cats: Cat[];
	};

	let { data }: { data: PageData } = $props();
	let selectedCat = $state<Cat | null>(null);
	let isOpen = $state(false);

	function openCat(cat: Cat) {
		selectedCat = cat;
		isOpen = true;
	}

	let filters = $state({
		search: '',
		toggles: {
			isOkDog: false,
			isOkCat: false,
			isOkChild: false
		}
	});

	function toggleFilter(key: keyof typeof filters.toggles) {
		filters.toggles[key] = !filters.toggles[key];
	}

	function resetFilters() {
		filters.search = '';
		Object.keys(filters.toggles).forEach((key) => {
			filters.toggles[key as keyof typeof filters.toggles] = false;
		});
	}

	let filteredCats = $derived(
		data.cats.filter((cat: Cat) => {
			const matchSearch =
				!filters.search || cat.name?.toLowerCase().includes(filters.search.toLowerCase());

			const matchToggles = (
				Object.entries(filters.toggles) as Array<[keyof typeof filters.toggles, boolean]>
			).every(([key, value]) => {
				if (!value) return true;
				return cat[key] === true;
			});

			return matchSearch && matchToggles;
		})
	);
</script>

<main class="flex justify-center p-4">
	<div class="max-w-10xl flex w-full flex-col gap-6 p-8">
		<h1 class="text-2xl font-bold">Ils attendent leur famille</h1>

		<!-- FILTER BAR -->
		<div
			class="bg-primary-foreground flex w-full flex-wrap items-center justify-between gap-4 rounded-4xl px-6 py-4"
		>
			<!-- FILTER BUTTONS -->
			<div class="flex flex-wrap gap-2">
				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.isOkDog ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('isOkDog')}
				>
					OK chien
				</button>

				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.isOkCat ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('isOkCat')}
				>
					OK chat
				</button>

				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.isOkChild ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('isOkChild')}
				>
					OK enfant
				</button>

				<button class="bg-primary rounded-full px-4 py-2 text-sm text-white" onclick={resetFilters}>
					Reset
				</button>
			</div>

			<!-- SEARCH -->
			<div class="flex items-center gap-2">
				<Search />
				<Input
					type="text"
					placeholder="Rechercher..."
					bind:value={filters.search}
					class="bg-background!"
				/>
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
		<Dialog.Root bind:open={isOpen}>
			<CatDialog {selectedCat} />
		</Dialog.Root>
	</div>
</main>
