<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import CatCard from '$lib/components/CatCard.svelte';
	import AreaChart from '$lib/components/AreaChart.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus } from 'lucide-svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';

	const cats = [
		{
			id: 1,
			name: 'Milo',
			image: '/img/cats/cat1.jpg',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		},
		{
			id: 2,
			name: 'Luna',
			image: '/img/cats/cat2.jpg',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		},
		{
			id: 3,
			name: 'Simba',
			image: '/img/cats/cat3.jpg',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		},
		{
			id: 4,
			name: 'Potichat',
			image: '/img/cats/cat4.jpg',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		}
	];

	const newsArray = [
		{
			id: 1,
			title: 'News 1',
			content:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		},
		{
			id: 2,
			title: 'News 2',
			content:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		},
		{
			id: 3,
			title: 'News 3',
			content:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		},
		{
			id: 4,
			title: 'News 4',
			content:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt tempore quas sint commodi nihil consequuntur.'
		}
	];
</script>

<section class="relative h-[50vh] w-full overflow-hidden">
	<iframe
		title="vidéo pattounes du coeur"
		class="pointer-events-none absolute top-1/2
           left-1/2 h-[56.25vw]
           min-h-full w-screen
           min-w-full -translate-x-1/2
           -translate-y-1/2"
		src="https://www.youtube.com/embed/f_szOVnCJ6A?autoplay=1&mute=1&loop=1&playlist=f_szOVnCJ6A&controls=0&modestbranding=1&rel=0"
		frameborder="0"
		allow="autoplay; fullscreen"
		allowfullscreen
	></iframe>
	<div class="relative z-10 flex h-full max-w-sm items-center px-10">
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
		{#each cats as cat (cat.id)}
			<CatCard name={cat.name} image={cat.image} description={cat.description} />
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

<section class=" flex flex-col gap-8 px-20 py-10">
	<h2 class="mb-10 text-center text-3xl font-bold">Nouveaux chats à adopter</h2>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each newsArray as news (news.id)}
			<NewsCard title={news.title} content={news.content} />
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
