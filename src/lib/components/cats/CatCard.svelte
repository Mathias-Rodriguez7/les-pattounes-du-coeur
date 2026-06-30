<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import SexIcon from '$lib/components/cats/SexIcon.svelte';
	import type { Cat } from '$lib/types/cat';
	import { focalPointClass } from '$lib/utils/catHelpers';

	type BadgeKey = 'isOkCat' | 'isOkDog' | 'isOkChild' | 'isOutside';

	const badges: { key: BadgeKey; label: string }[] = [
		{ key: 'isOkCat', label: 'OK chat' },
		{ key: 'isOkDog', label: 'OK chien' },
		{ key: 'isOkChild', label: 'OK enfant' },
		{ key: 'isOutside', label: 'Jardin' }
	];

	const { cat } = $props<{ cat: Cat }>();
</script>

<Card.Root
	class="flex h-full cursor-pointer flex-col overflow-hidden transition duration-300 hover:scale-105"
>
	<img
		src={cat.media?.[0]?.picture ?? '/img/logo.png'}
		alt={cat.name}
		class="h-85 w-full object-cover {focalPointClass[cat.focalPoint ?? 'MID']}"
	/>

	<Card.Header>
		<Card.Title>{cat.name}</Card.Title>
		<span class="flex gap-2">
			<SexIcon sex={cat.sex} class="size-4" />
			{cat.formattedAge}
		</span>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4">
		<div class="flex flex-wrap gap-2">
			{#each badges as badge (badge.key)}
				{#if cat[badge.key]}
					<Badge variant="soft">
						{badge.label}
					</Badge>
				{/if}
			{/each}

			{#if cat.ageBadge}
				<Badge variant="soft">
					{cat.ageBadge}
				</Badge>
			{/if}
		</div>

		<p class="text-muted-foreground line-clamp-3 text-sm">
			{cat.description}
		</p>
	</Card.Content>
</Card.Root>
