<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Cat } from '$lib/types/cat';

	type BadgeKey = 'isOkCat' | 'isOkDog' | 'isOkChild';

	const badges: { key: BadgeKey; label: string }[] = [
		{ key: 'isOkCat', label: 'OK chat' },
		{ key: 'isOkDog', label: 'OK chien' },
		{ key: 'isOkChild', label: 'OK enfant' }
	];

	const { cat } = $props<{ cat: Cat }>();
</script>

<Card.Root
	class="flex h-full cursor-pointer flex-col overflow-hidden transition duration-300 hover:scale-105"
>
	<img
		src={cat.media?.[0]?.picture ?? '/img/placeholder.jpg'}
		alt={cat.name}
		class="h-85 w-full object-cover"
	/>

	<Card.Header>
		<Card.Title>{cat.name}</Card.Title>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4">
		<div class="flex flex-wrap gap-2">
			{#each badges as badge (badge.key)}
				{#if cat[badge.key]}
					<Badge variant="outline" class="bg-accent">
						{badge.label}
					</Badge>
				{/if}
			{/each}
		</div>

		<p class="text-muted-foreground line-clamp-3 text-sm">
			{cat.description}
		</p>
	</Card.Content>

	<Card.Footer class="flex justify-end">
		<Button>Offrir un foyer</Button>
	</Card.Footer>
</Card.Root>
