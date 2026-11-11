<!-- src/lib/components/news/NewsCatsPanel.svelte -->
<script lang="ts">
	import type { CatListItem } from '$lib/types/cat';
	import CatCard from '../cats/CatCard.svelte';

	const { cats }: { cats: CatListItem[] } = $props();
</script>

{#if cats.length === 0}
	<p class="ml-6 text-sm text-muted-foreground italic">Aucun chat associé</p>
{:else}
	<div class="ml-6 grid grid-cols-2 gap-4 xl:grid-cols-3">
		{#each cats as cat (cat.id)}
			<CatCard {cat} />
		{/each}
	</div>
{/if}
