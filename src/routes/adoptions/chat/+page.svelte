<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Dialog from '$lib/components/ui/dialog';
	import CatCard from '$lib/components/CatCard.svelte';
	import CatDialog from '$lib/components/CatDialog.svelte';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/stores';
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

	type AgeFilter = 'ALL' | 'LT1' | '2_5' | 'GT5';
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
	// SYNC URL → STATE
	// -----------------------------
	$effect(() => {
		const params = $page.url.searchParams;

		filters.search = params.get('search') ?? '';

		filters.okDog = params.get('okDog') === null ? null : params.get('okDog') === 'true';
		filters.okCat = params.get('okCat') === null ? null : params.get('okCat') === 'true';
		filters.okChild = params.get('okChild') === null ? null : params.get('okChild') === 'true';

		filters.sex = (params.get('sex') as SexFilter) ?? 'ALL';
		filters.age = (params.get('age') as AgeFilter) ?? 'ALL';

		filters.garden = params.get('garden') === null ? null : params.get('garden') === 'true';
	});

	// -----------------------------
	// ACTIONS
	// -----------------------------
	function openCat(cat: Cat) {
		selectedCat = cat;
		isOpen = true;
	}

	function applyFilters() {
		const params = new URLSearchParams();

		if (filters.search) params.set('search', filters.search);

		if (filters.okDog !== null) params.set('okDog', String(filters.okDog));
		if (filters.okCat !== null) params.set('okCat', String(filters.okCat));
		if (filters.okChild !== null) params.set('okChild', String(filters.okChild));

		if (filters.sex !== 'ALL') params.set('sex', filters.sex);
		if (filters.age !== 'ALL') params.set('age', filters.age);

		if (filters.garden !== null) params.set('garden', String(filters.garden));

		goto(`/adoptions/chat?${params.toString()}`);
	}

	function resetFilters() {
		goto('/adoptions/chat');
	}

	// -----------------------------
	// DEEP LINK (dialog)
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
			class="bg-primary-foreground flex items-center justify-between gap-4 rounded-4xl px-6 py-4"
		>
			<Sheet.Root>
				<Sheet.Trigger>
					<Button>Filtres</Button>
				</Sheet.Trigger>

				<Sheet.Content side="left" class="w-96 space-y-6">
					<h2 class="text-xl font-bold">Filtres</h2>

					<label class="flex justify-between">
						OK chien
						<input type="checkbox" bind:checked={filters.okDog} />
					</label>

					<label class="flex justify-between">
						OK chat
						<input type="checkbox" bind:checked={filters.okCat} />
					</label>

					<label class="flex justify-between">
						OK enfant
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
							<option value="LT1">- 1 an</option>
							<option value="2_5">2 - 5 ans</option>
							<option value="GT5">+ 5 ans</option>
						</select>
					</div>

					<label class="flex justify-between">
						Besoin jardin
						<input type="checkbox" bind:checked={filters.garden} />
					</label>

					<Button onclick={applyFilters}>Appliquer</Button>
					<Button variant="outline" onclick={resetFilters}>Reset</Button>
				</Sheet.Content>
			</Sheet.Root>

			<div class="flex items-center gap-2">
				<Search />
				<Input bind:value={filters.search} placeholder="Rechercher..." />
			</div>
		</div>

		<!-- GRID -->
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.cats as cat (cat.id)}
				<button class="text-left" onclick={() => openCat(cat)}>
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
					replaceState('/adoptions/chat', {});
				}
			}}
		>
			<CatDialog {selectedCat} />
		</Dialog.Root>
	</div>
</main>
