<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import CatCard from '$lib/components/cats/CatCard.svelte';
	import AreaChart from '$lib/components/AreaChart.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus, Search, Heart, Home, ArrowRight, HeartHandshake } from 'lucide-svelte';
	import NewsCard from '$lib/components/news/NewsCard.svelte';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { fade, fly } from 'svelte/transition';
	import { cn } from '$lib/utils.js';

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
						<Card.Title>Bienvenue sur le site de l'association Les Pattounes du Cœur !</Card.Title>
					</Card.Header>
					<Card.Content>
						<p>
							Nous intervenons sur Montpellier et ses alentours auprès des chats errants et
							abandonnés.
						</p>
					</Card.Content>
					<Card.Footer class="flex justify-end">
						<a href={resolve(`/association/info`)}>
							<Button>En savoir plus</Button>
						</a>
					</Card.Footer>
				</Card.Root>
			</div>
		</section>

		<section class="flex flex-col gap-8 px-4 py-16 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold">Comment ça marche ?</h2>

			<div class="flex flex-col items-center gap-8 md:flex-row md:items-start">
				<!-- ÉTAPE 1 -->
				<div class="flex flex-1 flex-col items-center gap-4 text-center">
					<div
						class="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full"
					>
						<Search size={28} />
					</div>
					<h3 class="text-xl font-semibold">Signaler</h3>
					<p class="text-muted-foreground text-sm">
						Vous avez repéré un chat errant ou en détresse ? Signalez-le nous, nos bénévoles
						interviennent rapidement sur Montpellier et ses alentours.
					</p>
					<a href={resolve('/contact')}>
						<Button>Signaler un chat</Button>
					</a>
				</div>

				<!-- SÉPARATEUR -->
				<div class="text-muted-foreground hidden md:flex md:items-center md:pt-8">
					<ArrowRight size={32} />
				</div>

				<!-- ÉTAPE 2 -->
				<div class="flex flex-1 flex-col items-center gap-4 text-center">
					<div
						class="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full"
					>
						<Heart size={28} />
					</div>
					<h3 class="text-xl font-semibold">Soigner</h3>
					<p class="text-muted-foreground text-sm">
						Nos bénévoles prennent en charge le chat : vétérinaire, stérilisation, vaccins. Il est
						ensuite accueilli dans une famille d'accueil pour sa convalescence et sa
						sociabilisation, afin qu'il retrouve confiance en l'humain avant l'adoption.
					</p>

					<a href={resolve('/association/info')}>
						<Button>Notre mission</Button>
					</a>
				</div>

				<!-- SÉPARATEUR -->
				<div class="text-muted-foreground hidden md:flex md:items-center md:pt-8">
					<ArrowRight size={32} />
				</div>

				<!-- ÉTAPE 3 -->
				<div class="flex flex-1 flex-col items-center gap-4 text-center">
					<div
						class="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full"
					>
						<Home size={28} />
					</div>
					<h3 class="text-xl font-semibold">Adopter</h3>
					<p class="text-muted-foreground text-sm">
						Une fois rétabli, le chat est proposé à l'adoption. Trouvez votre compagnon et
						offrez-lui une vie heureuse et aimée !
					</p>
					<a href={resolve('/adoptions/chat')}>
						<Button>Voir les chats</Button>
					</a>
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-8 px-4 py-10 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold">Nouveaux chats à adopter</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.cats as cat, i (cat.id)}
					<a
						href={resolve(`/adoptions/chat?cat=${cat.id}`)}
						class={cn('block w-full', i > 0 && 'hidden sm:block')}
					>
						<CatCard {cat} />
					</a>
				{/each}
			</div>

			<div class="mt-4 flex justify-center">
				<a href={resolve(`/adoptions/chat`)}>
					<Button
						><span class="flex items-center gap-2">
							Voir <Plus />
						</span>
					</Button>
				</a>
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
					<Card.Root class="flex w-full flex-col gap-2 overflow-hidden p-0">
						<img src="/img/cat$.jpg" alt="cats" class="h-80 w-full object-cover object-center" />
						<div class="flex flex-col gap-2 p-4">
							<Card.Header class="p-0">
								<Card.Title>100% de vos dons sont utilisés pour eux.</Card.Title>
							</Card.Header>
							<Card.Content class="p-0">
								<p>Chaque contribution finance directement les soins et les besoins essentiels.</p>
							</Card.Content>
							<Card.Footer class="mt-auto flex justify-end p-0">
								<a
									href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
									target="_blank"
									rel="noopener noreferrer"
									title="helloasso"
								>
									<Button>Faire un don</Button>
								</a>
							</Card.Footer>
						</div>
					</Card.Root>
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-8 px-4 py-10 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold">News</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.news as news, i (news.id)}
					<a
						href={resolve(`/association/news?news=${news.id}`)}
						class={cn('block w-full', i > 0 && 'hidden sm:block')}
					>
						<NewsCard {news} />
					</a>
				{/each}
			</div>

			<div class="mt-4 flex justify-center">
				<a href={resolve(`/association/news`)}>
					<Button
						><span class="flex items-center gap-2">
							Voir <Plus />
						</span>
					</Button>
				</a>
			</div>
		</section>
	</div>

	<!-- Bouton flottant don -->
	<a
		href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
		target="_blank"
		rel="noopener noreferrer"
		class="fixed top-1/2 right-4 z-50 -translate-y-1/2"
	>
		<div
			class="group bg-primary text-primary-foreground flex items-center gap-0 overflow-hidden rounded-full p-4 shadow-lg transition-all duration-300 hover:gap-2 hover:px-4"
		>
			<HeartHandshake size={30} />
			<span
				class="max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300 group-hover:max-w-xs"
			>
				Faire un don
			</span>
		</div>
	</a>
</main>
