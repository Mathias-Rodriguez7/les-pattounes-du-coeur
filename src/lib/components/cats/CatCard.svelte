<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import SexIcon from '#lib/components/cats/SexIcon.svelte';
	import type { CatListItem } from '#lib/types/cat.ts';
	import { focalPointStyle } from '#lib/utils/catHelpers.ts';
	import { getAgeBadge } from '#lib/utils/age.ts';
	import { truncate } from '#lib/utils/string.ts';
	import { publicMediaUrl } from '#lib/media/urls.ts';

	let { cat }: { cat: CatListItem } = $props();

	// Image principale : le load serveur filtre déjà sur isPrimary, on prend la première
	const primaryMedia = $derived(cat.media[0] ?? null);
	const imageSrc = $derived(
		primaryMedia ? publicMediaUrl(primaryMedia.file.storageKey) : '/img/logo.png'
	);
	const imageStyle = $derived(focalPointStyle(primaryMedia));
</script>

<Card.Root
	class="flex h-full cursor-pointer flex-col overflow-hidden transition duration-300 hover:scale-105"
>
	<img
		src={imageSrc}
		alt={cat.name ?? cat.catNumber}
		class="h-85 w-full object-cover"
		style={imageStyle}
	/>

	<Card.Header>
		<Card.Title>{cat.name ?? cat.catNumber}</Card.Title>
		<span class="flex items-center gap-2">
			<SexIcon sex={cat.sex} class="size-6" />
			{getAgeBadge(cat.birthDate)}
		</span>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4">
		<p class="text-sm leading-relaxed text-muted-foreground">
			{truncate(cat.description, 60)}...
		</p>
	</Card.Content>
</Card.Root>
