<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { News } from '$lib/types/news';

	const { news } = $props<{ news: News }>();

	const catCount = news.cats.length;

	const content = `${catCount} chat${catCount > 1 ? 's' : ''} disponible${catCount > 1 ? 's' : ''} à l’adoption`;
</script>

<Card.Root class="flex h-full flex-col overflow-hidden transition duration-300 hover:scale-105">
	<div class="flex justify-center">
		<img src={news.image} alt={news.title} class="object-fit size-60" />
	</div>
	<Card.Header class="flex items-center justify-between">
		<Card.Title class="text-lg">{news.title}</Card.Title>
		<Card.Description class="text-xs">{news.date}</Card.Description>
	</Card.Header>
	<Card.Content class="flex-1">
		<p class="text-muted-foreground line-clamp-3 text-sm">
			{content}
		</p>
	</Card.Content>
	<Card.Footer class="flex justify-end">
		<Button>Lire la suite</Button>
	</Card.Footer>
</Card.Root>
