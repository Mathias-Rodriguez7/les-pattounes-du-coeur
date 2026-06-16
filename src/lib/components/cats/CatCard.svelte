<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { Cat } from '$lib/types/cat';

	type BadgeKey = 'isOkCat' | 'isOkDog' | 'isOkChild' | 'isOutside';

	const badges: { key: BadgeKey; label: string }[] = [
		{ key: 'isOkCat', label: 'OK chat' },
		{ key: 'isOkDog', label: 'OK chien' },
		{ key: 'isOkChild', label: 'OK enfant' },
		{ key: 'isOutside', label: 'Jardin' }
	];

	function getAgeBadge(months: number): string {
		const years = months / 12;

		if (years < 1) return 'Chaton';
		if (years < 7) return 'Adulte';
		if (years < 10) return 'Senior';
		return 'Super senior';
	}

	const { cat } = $props<{ cat: Cat }>();
</script>

<Card.Root
	class="flex h-full cursor-pointer flex-col overflow-hidden transition duration-300 hover:scale-105"
>
	<img
		src={cat.media?.[0]?.picture ?? '/img/logo.png'}
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

			{#if cat.age !== undefined}
				<Badge variant="outline" class="bg-accent">
					{getAgeBadge(cat.age)}
				</Badge>
			{/if}
		</div>

		<p class="text-muted-foreground line-clamp-3 text-sm">
			{cat.description}
		</p>
	</Card.Content>
</Card.Root>
