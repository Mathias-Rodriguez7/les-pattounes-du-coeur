<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { formatDate } from '$lib/utils/date';

	interface Props {
		news: { title: string; createdAt: Date; cats: unknown[] };
	}

	let { news }: Props = $props();

	// $derived : le texte suit la news si elle change (c'était l'avertissement de svelte-check)
	const content = $derived.by(() => {
		const n = news.cats.length;
		const s = n > 1 ? 's' : '';
		return `${n} chat${s} disponible${s} à l'adoption`;
	});
</script>

<Card.Root class="flex h-full flex-col overflow-hidden transition duration-300 hover:scale-105">
	<div class="flex justify-center">
		<img src="/img/news/cat.news.png" alt={news.title} class="object-fit size-60" />
	</div>
	<Card.Header class="flex items-center justify-between">
		<Card.Title class="text-lg">{news.title}</Card.Title>
		<Card.Description class="text-xs">{formatDate(news.createdAt)}</Card.Description>
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
