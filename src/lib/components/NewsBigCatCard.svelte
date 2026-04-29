<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Carousel from '$lib/components/ui/carousel';
	import CatCard from './CatCard.svelte';

	const { title, cats, date } = $props();

	// 💡 description dynamique
	const description = `${cats.length} chat${cats.length > 1 ? 's' : ''} disponible${
		cats.length > 1 ? 's' : ''
	} à l’adoption`;
</script>

<Card.Root class="flex h-full flex-col overflow-hidden">
	<!-- HEADER -->
	<Card.Header class="space-y-2">
		<div class="flex flex-col gap-3">
			<!-- 🐾 ICON -->
			<div class="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-xl">
				<img
					src="/img/news/cat.news.png"
					alt="logo news cat"
					class="w-full shrink-0 object-cover"
				/>
			</div>

			<!-- TITLE + DATE -->
			<div class="flex items-center justify-between">
				<Card.Title class="text-lg">{title}</Card.Title>
				<Card.Description class="text-xs">{date}</Card.Description>
			</div>
		</div>

		<!-- DESCRIPTION -->
		<p class="text-muted-foreground text-sm">{description}</p>
	</Card.Header>

	<!-- CAROUSEL -->
	<Card.Content class="relative flex-1 p-4">
		<Carousel.Root class="flex h-full flex-col gap-6">
			<Carousel.Content class="flex">
				{#each cats as cat (cat.id)}
					<Carousel.Item class="basis-full p-2 md:basis-1/2 lg:basis-1/3">
						<CatCard {cat} />
					</Carousel.Item>
				{/each}
			</Carousel.Content>

			<!-- NAVIGATION -->
			<div class="flex justify-between">
				<Carousel.Previous class="static" />
				<Carousel.Next class="static" />
			</div>
		</Carousel.Root>
	</Card.Content>
</Card.Root>
