<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel';
	import CatCard from './CatCard.svelte';

	const { cats } = $props();

	const description = `${cats.length} chat${cats.length > 1 ? 's' : ''} disponible${
		cats.length > 1 ? 's' : ''
	} à l’adoption`;
</script>

<div class="flex w-full flex-col gap-6 p-6">
	<!-- 🐱 HEADER -->
	<div class="flex items-center gap-4">
		<div class="flex justify-center overflow-hidden rounded-2xl">
			<img src="/img/news/cat.news.png" alt="logo news cat" class="object-fit size-32" />
		</div>

		<div>
			<p class="text-lg font-semibold">Nouveaux chats</p>
			<p class="text-muted-foreground text-sm">{description}</p>
		</div>
	</div>

	<!-- 🎠 CAROUSEL -->
	<Carousel.Root class="flex flex-col">
		<Carousel.Content class="flex p-6">
			{#each cats as cat (cat.id)}
				<Carousel.Item class="sm:basis-1/2 lg:basis-1/3">
					<a href={`/adoptions/chat?cat=${cat.id}`} class="block w-full">
						<CatCard {cat} />
					</a>
				</Carousel.Item>
			{/each}
		</Carousel.Content>

		<!-- 🎮 NAVIGATION -->
		<div class="flex justify-between">
			<Carousel.Previous />
			<Carousel.Next />
		</div>
	</Carousel.Root>
</div>
