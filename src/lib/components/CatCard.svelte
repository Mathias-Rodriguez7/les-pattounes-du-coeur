<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	type Cat = {
		name: string | null;
		description: string | null;
		media?: { picture: string }[];
	};

	const { cat } = $props<{ cat: Cat }>();
</script>

<Card.Root class="flex h-full flex-col overflow-hidden transition duration-300 hover:scale-105">
	<img
		src={cat.media?.[0]?.picture ?? '/img/placeholder.jpg'}
		alt={cat.name ?? 'cat'}
		class="h-85 w-full object-cover"
	/>

	<Card.Header>
		<Card.Title>{cat.name}</Card.Title>
	</Card.Header>

	<Card.Content>
		<Badge variant="outline">Chat</Badge>

		<p class="text-muted-foreground line-clamp-3 text-sm">
			{cat.description}
		</p>
	</Card.Content>

	<Card.Footer class="flex justify-end">
		<Button>Offrir un foyer</Button>
	</Card.Footer>
</Card.Root>
