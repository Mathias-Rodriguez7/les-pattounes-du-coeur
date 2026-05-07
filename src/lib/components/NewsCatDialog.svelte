<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel';
	import CatCard from './CatCard.svelte';
	import type { Cat } from '$lib/types/cat';
	import { resolve } from '$app/paths';

	const { cats } = $props<{ cats: Cat[] }>();

	const catCount = cats.length;

	const content = `${catCount} chat${catCount > 1 ? 's' : ''} disponible${catCount > 1 ? 's' : ''} à l’adoption`;
</script>

<div class="flex w-full flex-col gap-6 p-6">
	<!-- 🐱 HEADER -->
	<div class="flex items-center gap-4">
		<div class="flex justify-center overflow-hidden rounded-2xl">
			<img src="/img/news/cat.news.png" alt="logo news cat" class="object-fit size-32" />
		</div>

		<div>
			<p class="text-lg font-semibold">Nouveaux chats</p>
			<p class="text-muted-foreground text-sm">{content}</p>
		</div>
	</div>

	<!-- 🎠 CAROUSEL -->
	<Carousel.Root class="flex flex-col">
		<Carousel.Content class="flex p-6">
			{#each cats as cat (cat.id)}
				<Carousel.Item class="sm:basis-1/2 lg:basis-1/3">
					<a href={resolve(`/adoptions/chat?cat=${cat.id}`)} class="block w-full">
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
