<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from 'lucide-svelte';
	import CatCard from '$lib/components/CatCard.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<main class="flex flex-col items-center gap-6 p-4">
	<h1>Ils attendent leur famille</h1>

	<!-- FILTER BAR -->
	<div class="bg-primary-foreground flex w-full items-center justify-between rounded-4xl px-8 py-4">
		<Badge variant="outline">Badge</Badge>

		<div class="flex items-center gap-4">
			<Search />
			<Input type="text" placeholder="Recherche" class="max-w-xs" />
		</div>
	</div>

	<!-- GRID -->
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each data.cats as cat (cat.id)}
			<CatCard {cat} />
		{/each}
	</section>
</main>
