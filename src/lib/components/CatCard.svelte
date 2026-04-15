<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	const { name, image, description } = $props();
</script>

<Card.Root class="overflow-hidden transition duration-300 hover:scale-105">
	<img src={image} alt={name} class="h-48 w-full object-cover" />
	<Card.Header>
		<Card.Title>{name}</Card.Title>
	</Card.Header>
	<Card.Content>
		<div>
			<Badge variant="outline">Badge</Badge>
		</div>
		<p class="text-muted-foreground line-clamp-3 text-sm">
			{description}
		</p>
	</Card.Content>
	<Card.Footer class="flex justify-end">
		<Button>Offrir un foyer</Button>
	</Card.Footer>
</Card.Root>
