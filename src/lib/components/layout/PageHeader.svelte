<script lang="ts">
	import type { Snippet } from 'svelte';

	// L'en-tête d'une page : le titre (le <h1>), un nombre facultatif, une phrase dessous,
	// et des boutons à droite. La même taille de titre partout (avant : text-2xl ici, 3xl là).

	interface Props {
		title: string;
		/** Un nombre à côté du titre (ex : le nombre de documents) */
		count?: number;
		subtitle?: string;
		/** Boutons à droite du titre (ex : « Nouveau document ») */
		actions?: Snippet;
		class?: string;
	}

	let { title, count, subtitle, actions, class: className = '' }: Props = $props();
</script>

<header class="flex flex-wrap items-start justify-between gap-3 {className}">
	<div>
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
			{title}
			{#if count !== undefined}
				<span class="text-base font-normal text-muted-foreground">· {count}</span>
			{/if}
		</h1>
		{#if subtitle}
			<p class="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
		{/if}
	</div>
	{@render actions?.()}
</header>
