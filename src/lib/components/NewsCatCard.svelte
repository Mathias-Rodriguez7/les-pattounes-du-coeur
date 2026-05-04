<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	const { title, image, cats, date } = $props();

	const content = `${cats.length} chat${cats.length > 1 ? 's' : ''} disponible${
		cats.length > 1 ? 's' : ''
	} à l’adoption`;
</script>

<Card.Root class="flex h-full flex-col overflow-hidden transition duration-300 hover:scale-105">
	<div class="flex justify-center">
		<img src={image} alt={title} class="object-fit size-60" />
	</div>
	<Card.Header class="flex items-center justify-between">
		<Card.Title class="text-lg">{title}</Card.Title>
		<Card.Description class="text-xs">{date}</Card.Description>
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
