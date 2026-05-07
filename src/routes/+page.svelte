<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import CatCard from '$lib/components/CatCard.svelte';
	import AreaChart from '$lib/components/AreaChart.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus } from 'lucide-svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { fade, fly } from 'svelte/transition';

	let { data }: { data: PageData } = $props();
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }}>
		<section class="relative h-[50vh] w-full overflow-hidden">
			<video
				autoplay
				muted
				loop
				playsinline
				class="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
			>
				<source src="/videos/cat.mp4" type="video/mp4" />
			</video>
			<div class="relative z-10 hidden h-full max-w-sm items-center px-10 md:flex">
				<Card.Root class="bg-accent relative z-10">
					<Card.Header>
						<Card.Title>Les Pattounes du coeur</Card.Title>
					</Card.Header>
					<Card.Content>
						<p>
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint
							commodi nihil consequuntur.
						</p>
					</Card.Content>
					<Card.Footer class="flex justify-end">
						<Button>Offrir un foyer</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		</section>

		<section class="flex flex-col gap-8 px-4 py-10 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold">Nouveaux chats à adopter</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.cats as cat (cat.id)}
					<a href={resolve(`/adoptions/chat?cat=${cat.id}`)} class="block w-full">
						<CatCard {cat} />
					</a>
				{/each}
			</div>

			<div class="mt-4 flex justify-center">
				<Button
					><span class="flex items-center gap-2">
						Voir <Plus />
					</span>
				</Button>
			</div>
		</section>

		<section class="bg-accent-foreground flex flex-col gap-8 px-4 py-10 md:px-10 lg:px-20">
			<h2 class="text-popover mb-10 text-center text-3xl font-bold">Chaque don change une vie</h2>
			<div
				class="bg-primary-foreground flex flex-col gap-6 rounded-2xl p-4 md:p-6 lg:flex-row lg:items-stretch lg:gap-10 lg:p-10"
			>
				<div class="flex w-full lg:w-3/4">
					<div class="h-full w-full">
						<AreaChart />
					</div>
				</div>
				<div class="flex w-full lg:w-1/4">
					<Card.Root class="flex w-full flex-col gap-2">
						<img src="/img/cats/cats.help.jpg" alt="cats" class="h-auto w-full object-cover" />
						<Card.Header>
							<Card.Title>100% de vos dons sont utilisés pour eux.</Card.Title>
						</Card.Header>
						<Card.Content>
							<p>Chaque contribution finance directement les soins et les besoins essentiels.</p>
						</Card.Content>
						<Card.Footer class="mt-auto flex justify-end">
							<a
								href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
								target="_blank"
								rel="noopener noreferrer"
								title="helloasso"
							>
								<Button><span class="flex items-center gap-2"> Faire un don </span></Button>
							</a>
						</Card.Footer>
					</Card.Root>
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-8 px-4 py-10 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold">News</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.news as news (news.id)}
					<a href={resolve(`/association/news?news=${news.id}`)} class="block w-full">
						<NewsCard {news} />
					</a>
				{/each}
			</div>
			<div class="mt-4 flex justify-center">
				<Button
					><span class="flex items-center gap-2">
						Voir <Plus />
					</span>
				</Button>
			</div>
		</section>
	</div>
</main>
