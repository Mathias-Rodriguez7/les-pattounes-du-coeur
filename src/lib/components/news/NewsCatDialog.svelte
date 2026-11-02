<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel';
	import CatCard from '$lib/components/cats/CatCard.svelte';
	import type { NewsFull } from '$lib/types/news';
	import type { CatListItem } from '$lib/types/cat';
	import { formatDate } from '$lib/utils/date';
	import { resolve } from '$app/paths';

	const { news, cats = [] }: { news: NewsFull; cats?: CatListItem[] } = $props();

	const content = $derived(
		`${cats.length} chat${cats.length > 1 ? 's' : ''} disponible${cats.length > 1 ? 's' : ''} à l'adoption`
	);
</script>

<div class="flex w-full flex-col gap-6 p-6">
	<!-- 🐱 HEADER -->
	<div class="flex justify-between">
		<div class="flex items-center gap-4">
			<div class="flex justify-center overflow-hidden rounded-2xl">
				<img src="/img/news/cat.news.png" alt="logo news cat" class="object-fit size-32" />
			</div>

			<div>
				<p class="text-lg font-semibold">Nouveaux chats</p>
				<p class="text-muted-foreground text-sm">{content}</p>
			</div>
		</div>
		<div class="self-center">
			<p class="text-sm opacity-70">{formatDate(new Date(news.createdAt))}</p>
		</div>
	</div>

	<!-- 🎠 CAROUSEL -->
	{#if cats.length > 0}
		<Carousel.Root class="flex flex-col">
			<Carousel.Content class="p-6">
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
	{:else}
		<p class="text-muted-foreground text-center text-sm">Aucun chat disponible</p>
	{/if}
</div>
