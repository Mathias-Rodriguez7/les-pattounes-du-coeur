<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	const { title, image, content } = $props();
</script>

<Card.Root class="flex h-full flex-col overflow-hidden transition duration-300 hover:scale-105">
	<img src={image} alt={title} class="w-full shrink-0 object-cover" />
	<Card.Header>
		<Card.Title>{title}</Card.Title>
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
