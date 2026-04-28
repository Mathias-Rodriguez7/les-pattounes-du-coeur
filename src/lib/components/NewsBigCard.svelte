<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	const { title, image, content, date } = $props();
</script>

<Card.Root class="flex h-full flex-col overflow-hidden">
	<ScrollArea class="h-130">
		<div class="flex justify-center">
			<img src={image} alt={title} class="w-2/6 shrink-0 object-cover" />
		</div>

		<Card.Header class="flex justify-between">
			<Card.Title>{title}</Card.Title>
			<Card.Description>{date}</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-muted-foreground text-sm leading-relaxed">
				{content}
			</p>
		</Card.Content>
	</ScrollArea>
</Card.Root>
