<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import CatCard from '$lib/components/cats/CatCard.svelte';
	import CatDialog from '$lib/components/cats/CatDialog.svelte';
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

	type AgeFilter = 'ALL' | 'CHATON' | 'JUNIOR' | 'ADULT' | 'SENIOR';
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

	function getAgeInMonths(birthDate: Date | null): number {
		if (!birthDate) return 0;
		const now = new Date();
		const birth = new Date(birthDate);
		return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
	}

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
			const months = getAgeInMonths(cat.birthDate);
			if (filters.age === 'CHATON' && months >= 6) return false;
			if (filters.age === 'JUNIOR' && (months < 6 || months > 36)) return false;
			if (filters.age === 'ADULT' && (months < 36 || months > 120)) return false;
			if (filters.age === 'SENIOR' && months <= 120) return false;
		}

		return true;
	}

	let filteredCats = $derived(data.cats.filter(matches));

	const sexOptions = [
		{ value: 'ALL', label: 'Tous' },
		{ value: 'MALE', label: 'Mâle' },
		{ value: 'FEMALE', label: 'Femelle' }
	];

	const ageOptions = [
		{ value: 'ALL', label: 'Tous' },
		{ value: 'CHATON', label: 'Chaton' },
		{ value: 'JUNIOR', label: 'Junior' },
		{ value: 'ADULT', label: 'Adulte' },
		{ value: 'SENIOR', label: 'Senior' }
	];
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
		<div class="bg-card flex flex-wrap items-center justify-between gap-4 rounded-4xl px-6 py-4">
			<!-- FILTER BUTTON -->
			<Sheet.Root>
				<Sheet.Trigger>
					<Button>Filtres</Button>
				</Sheet.Trigger>

				<Sheet.Content side="left" class="w-95 space-y-8 p-6">
					<!-- HEADER -->
					<div class="space-y-1">
						<h2 class="text-2xl font-bold">Filtres</h2>
						<p class="text-muted-foreground text-sm">Affinez votre recherche</p>
					</div>

					<!-- COMPATIBILITÉS -->
					<div class="space-y-4">
						<h3 class="text-sm font-semibold tracking-wide uppercase opacity-70">Compatibilités</h3>

						<div class="space-y-3">
							<Label
								class="hover:bg-secondary flex items-center gap-3 rounded-4xl border p-3 transition"
							>
								<Checkbox
									checked={filters.okDog ?? false}
									onCheckedChange={(checked) => {
										filters.okDog = checked ? true : null;
									}}
								/>
								<div>
									<p class="text-muted-foreground text-xs">Compatible avec les chiens</p>
								</div>
							</Label>

							<Label
								class="hover:bg-secondary flex items-center gap-3 rounded-4xl border p-3 transition"
							>
								<Checkbox
									checked={filters.okCat ?? false}
									onCheckedChange={(checked) => {
										filters.okCat = checked ? true : null;
									}}
								/>
								<div>
									<p class="text-muted-foreground text-xs">Compatible avec les chats</p>
								</div>
							</Label>

							<Label
								class="hover:bg-secondary flex items-center gap-3 rounded-4xl border p-3 transition"
							>
								<Checkbox
									checked={filters.okChild ?? false}
									onCheckedChange={(checked) => {
										filters.okChild = checked ? true : null;
									}}
								/>
								<div>
									<p class="text-muted-foreground text-xs">Compatible avec les enfants</p>
								</div>
							</Label>

							<Label
								class="hover:bg-secondary flex items-center gap-3 rounded-4xl border p-3 transition"
							>
								<Checkbox
									checked={filters.garden ?? false}
									onCheckedChange={(checked) => {
										filters.garden = checked ? true : null;
									}}
								/>
								<div>
									<p class="text-muted-foreground text-xs">Accès extérieur recommandé</p>
								</div>
							</Label>
						</div>
					</div>

					<!-- SEXE -->
					<div class="space-y-2">
						<h3 class="text-sm font-semibold tracking-wide uppercase opacity-70">Sexe</h3>

						<Select.Root type="single" bind:value={filters.sex}>
							<Select.Trigger class="w-full">
								{sexOptions.find((s) => s.value === filters.sex)?.label}
							</Select.Trigger>

							<Select.Content>
								{#each sexOptions as option (option.value)}
									<Select.Item value={option.value}>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- ÂGE -->
					<div class="space-y-2">
						<h3 class="text-sm font-semibold tracking-wide uppercase opacity-70">Âge</h3>

						<Select.Root type="single" bind:value={filters.age}>
							<Select.Trigger class="w-full">
								{ageOptions.find((a) => a.value === filters.age)?.label}
							</Select.Trigger>

							<Select.Content>
								{#each ageOptions as option (option.value)}
									<Select.Item value={option.value}>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- ACTION -->
					<Button variant="outline" class="h-16 w-full text-xl" onclick={resetFilters}>
						Réinitialiser les filtres
					</Button>
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
			{:else}
				<div
					class="col-span-full flex flex-col items-center justify-center gap-4 py-20 text-center"
				>
					<img src="/img/3.cats.jpg" alt="3.cats" class="h-40" />
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
					history.replaceState({}, '', '/adoptions/chat');
				}
			}}
		>
			<CatDialog {selectedCat} />
		</Dialog.Root>
	</div>
</main>
