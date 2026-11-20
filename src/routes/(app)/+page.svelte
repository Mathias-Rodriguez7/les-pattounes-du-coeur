<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import CatCard from '#lib/components/cats/CatCard.svelte';
	import AreaChart from '#lib/components/AreaChart.svelte';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import { Plus, Search, Heart, Home, ArrowRight, Pause, Play } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import SupportCat from '#lib/components/support/SupportCat.svelte';
	import NewsCard from '#lib/components/news/NewsCard.svelte';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { fade, fly } from 'svelte/transition';
	import { cn } from '#lib/utils.js';

	let { data }: { data: PageData } = $props();

	// La vidéo d'accueil (1 Mo, 720p) tourne en boucle : on doit pouvoir l'arrêter (WCAG 2.2.2).
	// Elle n'est chargée que sur un écran large, sans « économie de données » ni « réduire les
	// animations » : sinon, l'image fixe (40 Ko) suffit. Au chargement, c'est toujours l'image.
	let videoPaused = $state(false);
	let showVideo = $state(false);
	onMount(() => {
		const wide = window.matchMedia('(min-width: 768px)').matches;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const saveData =
			(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
			true;
		showVideo = wide && !reduceMotion && !saveData;
	});
</script>

<svelte:head>
	<title>Les Pattounes du Cœur – Protection des chats à Montpellier</title>
	<meta
		name="description"
		content="Association de Montpellier qui secourt, soigne et fait adopter les chats errants et abandonnés. Adoptez, accueillez, soutenez."
	/>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<!-- Le titre de la page, pour les lecteurs d'écran et les moteurs de recherche -->
	<h1 class="sr-only">Les Pattounes du Cœur, association de protection des chats à Montpellier</h1>
	<div in:fly={{ y: 20, duration: 300 }}>
		<!-- La vidéo passe SOUS le menu flottant (qui la floute) : la section remonte de la hauteur
		     du menu (4rem mobile, 4.75rem ordinateur) et grandit d'autant, la partie visible ne change pas -->
		<section
			class="relative -mt-16 h-[calc(50vh+4rem)] w-full overflow-hidden md:-mt-[4.75rem] md:h-[calc(50vh+4.75rem)]"
		>
			<!-- L'image fixe : tout de suite affichée, et seule sur téléphone -->
			<img
				src="/img/hero-poster.webp"
				alt=""
				fetchpriority="high"
				class="absolute inset-0 h-full w-full object-cover"
			/>
			{#if showVideo}
				<video
					bind:paused={videoPaused}
					autoplay
					muted
					loop
					playsinline
					poster="/img/hero-poster.webp"
					class="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
					><source src="/videos/cat-hero.mp4" type="video/mp4" /></video
				>
			{/if}

			<!-- Mettre la vidéo en pause / la relancer (seulement quand elle est là) -->
			{#if showVideo}
				<button
					type="button"
					onclick={() => (videoPaused = !videoPaused)}
					aria-label={videoPaused ? 'Lire la vidéo' : 'Mettre la vidéo en pause'}
					title={videoPaused ? 'Lire la vidéo' : 'Mettre la vidéo en pause'}
					class="absolute bottom-3 left-3 z-20 flex size-10 items-center justify-center rounded-full bg-background/70 text-foreground shadow-md backdrop-blur transition-colors hover:bg-background/90"
				>
					{#if videoPaused}<Play class="size-4" />{:else}<Pause class="size-4" />{/if}
				</button>
			{/if}

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

		<!-- Mobile : la carte « Bienvenue » ne tient pas sur la vidéo, elle passe dessous -->
		<section class="px-4 pt-6 md:hidden">
			<div
				class="flex flex-col gap-3 rounded-2xl border border-accent/40 bg-accent/70 p-5 shadow-sm"
			>
				<h2 class="text-lg font-semibold">Bienvenue chez Les Pattounes du Cœur !</h2>
				<p class="text-sm text-muted-foreground">
					Nous intervenons sur Montpellier et ses alentours auprès des chats errants et abandonnés.
				</p>
				<div class="flex flex-wrap gap-2">
					<a href={resolve('adoptions/chat')} class={buttonVariants()}>Voir les chats à adopter</a>
					<a href={resolve('association/info')} class={buttonVariants({ variant: 'outline' })}>
						En savoir plus
					</a>
				</div>
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
						<img
							src="/img/cat$.webp"
							alt="Un chat gris couché au milieu de billets de banque"
							class="h-80 w-full object-cover object-center"
						/>
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
