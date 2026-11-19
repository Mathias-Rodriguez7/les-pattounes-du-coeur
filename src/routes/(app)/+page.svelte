<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import CatCard from '#lib/components/cats/CatCard.svelte';
	import AreaChart from '#lib/components/AreaChart.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Plus, Search, Heart, Home, ArrowRight } from '@lucide/svelte';
	import SupportCat from '#lib/components/support/SupportCat.svelte';
	import NewsCard from '#lib/components/news/NewsCard.svelte';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { fade, fly } from 'svelte/transition';
	import { cn } from '#lib/utils.js';

	let { data }: { data: PageData } = $props();
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }}>
		<!-- La vidéo passe SOUS le menu flottant (qui la floute) : la section remonte de la hauteur
		     du menu (4rem mobile, 4.75rem ordinateur) et grandit d'autant, la partie visible ne change pas -->
		<section
			class="relative -mt-16 h-[calc(50vh+4rem)] w-full overflow-hidden md:-mt-[4.75rem] md:h-[calc(50vh+4.75rem)]"
		>
			<video
				autoplay
				muted
				loop
				playsinline
				class="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
				><source src="/videos/cat.mp4" type="video/mp4" /></video
			>

			<!-- pt : la carte reste centrée dans la partie visible, sous le menu -->
			<div class="relative z-10 hidden h-full max-w-sm items-center px-10 pt-[4.75rem] md:flex">
				<!-- Même verre dépoli que le menu : on devine la vidéo derrière -->
				<Card.Root
					class="relative z-10 border border-accent/40 bg-accent/70 shadow-md backdrop-blur-lg"
				>
					<Card.Header
						><Card.Title>Bienvenue sur le site de l'association Les Pattounes du Cœur !</Card.Title
						></Card.Header
					>
					<Card.Content
						><p>
							Nous intervenons sur Montpellier et ses alentours auprès des chats errants et
							abandonnés.
						</p></Card.Content
					>
					<Card.Footer class="flex justify-end"
						><a href={resolve(`association/info`)}><Button>En savoir plus</Button></a></Card.Footer
					>
				</Card.Root>
			</div>
		</section>

		<section class="flex flex-col gap-8 px-4 py-16 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold">Comment ça marche ?</h2>

			<div class="flex flex-col items-center gap-8 md:flex-row md:items-start">
				<!-- ÉTAPE 1 -->
				<div class="flex flex-1 flex-col items-center gap-4 text-center">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						<Search size={28} />
					</div>
					<h3 class="text-xl font-semibold">Signaler</h3>
					<p class="text-sm text-muted-foreground">
						Vous avez repéré un chat errant ou en détresse ? Signalez-le nous, nos bénévoles
						interviennent sur Montpellier et ses alentours.
					</p>

					<a href={resolve('agir')}><Button>Signaler un chat</Button></a>
				</div>

				<!-- SÉPARATEUR -->
				<div class="hidden text-muted-foreground md:flex md:items-center md:pt-8">
					<ArrowRight size={32} />
				</div>

				<!-- ÉTAPE 2 -->
				<div class="flex flex-1 flex-col items-center gap-4 text-center">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						<Heart size={28} />
					</div>
					<h3 class="text-xl font-semibold">Soigner</h3>
					<p class="text-sm text-muted-foreground">
						Nos bénévoles prennent en charge le chat : vétérinaire, stérilisation, vaccins. Il est
						ensuite accueilli dans une famille d'accueil pour sa convalescence et sa
						sociabilisation, afin qu'il retrouve confiance en l'humain avant l'adoption.
					</p>

					<a href={resolve('association/info')}><Button>Notre mission</Button></a>
				</div>

				<!-- SÉPARATEUR -->
				<div class="hidden text-muted-foreground md:flex md:items-center md:pt-8">
					<ArrowRight size={32} />
				</div>

				<!-- ÉTAPE 3 -->
				<div class="flex flex-1 flex-col items-center gap-4 text-center">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						<Home size={28} />
					</div>
					<h3 class="text-xl font-semibold">Adopter</h3>
					<p class="text-sm text-muted-foreground">
						Une fois rétabli, le chat est proposé à l'adoption. Trouvez votre compagnon et
						offrez-lui une vie heureuse et aimée !
					</p>

					<a href={resolve('adoptions/chat')}><Button>Voir les chats</Button></a>
				</div>
			</div>
		</section>

		<section class="flex flex-col gap-8 px-4 py-10 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold">Nouveaux chats à adopter</h2>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each data.cats as cat, i (cat.id)}
					<a
						href={resolve(`adoptions/chat?cat=${cat.id}`)}
						class={cn('block w-full', i > 0 && 'hidden sm:block')}><CatCard {cat} /></a
					>
				{/each}
			</div>

			<div class="mt-4 flex justify-center">
				<a href={resolve(`adoptions/chat`)}
					><Button><span class="flex items-center gap-2">Voir <Plus /></span></Button></a
				>
			</div>
		</section>

		<section class="flex flex-col gap-8 bg-accent-foreground px-4 py-10 md:px-10 lg:px-20">
			<h2 class="mb-10 text-center text-3xl font-bold text-popover">Chaque don change une vie</h2>
			<div
				class="flex flex-col gap-6 rounded-2xl bg-primary-foreground p-4 md:p-6 lg:flex-row lg:items-stretch lg:gap-10 lg:p-10"
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
								<a href={resolve('don')}>
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
						href={resolve(`association/news?news=${news.id}`)}
						class={cn('block w-full', i > 0 && 'hidden sm:block')}><NewsCard {news} /></a
					>
				{/each}
			</div>

			<div class="mt-4 flex justify-center">
				<a href={resolve(`association/news`)}
					><Button><span class="flex items-center gap-2">Voir <Plus /></span></Button></a
				>
			</div>
		</section>
	</div>

	<!-- Le chat Leegloo en bas à droite : partenariat SAFTI et don -->
	<SupportCat />
</main>
