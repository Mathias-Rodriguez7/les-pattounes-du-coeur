<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import Skeleton from '#lib/components/ui/skeleton/skeleton.svelte';

	// Une image avec un squelette gris qui « respire » tant qu'elle charge,
	// puis qui apparaît en fondu : plus de bloc vide qui saute d'un coup.

	type Props = HTMLImgAttributes & {
		/** La boîte qui garde la place de l'image (taille, position) */
		wrapperClass?: string;
	};
	let { wrapperClass = '', class: className = '', ...rest }: Props = $props();

	let img = $state<HTMLImageElement | null>(null);
	let loaded = $state(false);

	// Image déjà en cache (ou chargée avant que la page soit active) : pas de squelette
	$effect(() => {
		if (img?.complete && img.naturalWidth > 0) loaded = true;
	});
</script>

<span class="relative block overflow-hidden {wrapperClass}">
	{#if !loaded}
		<Skeleton class="absolute inset-0 rounded-none" aria-hidden="true" />
	{/if}
	<img
		bind:this={img}
		{...rest}
		onload={() => (loaded = true)}
		onerror={() => (loaded = true)}
		class="transition-opacity duration-300 {loaded ? 'opacity-100' : 'opacity-0'} {className}"
	/>
</span>
