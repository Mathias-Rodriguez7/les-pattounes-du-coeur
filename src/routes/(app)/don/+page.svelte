<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { ExternalLink } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { HELLOASSO_URL, TEAMING_URL } from '#lib/constants/donation.ts';

	// Les deux façons de donner : une fois (HelloAsso) ou tous les mois (Teaming).
	// Le logo ET le bouton ouvrent le site : beaucoup ne pensent pas à cliquer sur une image
	const WAYS = [
		{
			title: 'Don ponctuel',
			tag: 'Une fois',
			tagClass: 'bg-sky-100 text-sky-800',
			text: 'Le montant de votre choix, en une seule fois, par carte bancaire.',
			href: HELLOASSO_URL,
			logo: '/img/helloasso.png',
			site: 'HelloAsso',
			cta: 'Donner avec HelloAsso'
		},
		{
			title: 'Don mensuel',
			tag: '1 € par mois',
			tagClass: 'bg-green-100 text-green-800',
			text: 'Rejoignez notre groupe Teaming : 1 € par mois, sans engagement. Les petits dons réguliers de chacun nous permettent de prévoir les soins.',
			href: TEAMING_URL,
			logo: '/img/teaming.png',
			site: 'Teaming',
			cta: 'Rejoindre sur Teaming'
		}
	];
</script>

<svelte:head>
	<title>Faire un don – Les Pattounes du Cœur</title>
</svelte:head>

<!-- eslint-disable svelte/no-navigation-without-resolve -- liens vers HelloAsso et Teaming, pas des routes -->
<main in:fade={{ duration: 200 }} class="flex justify-center px-4 py-8">
	<div in:fly={{ y: 20, duration: 300 }} class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<!-- EN-TÊTE -->
		<Card.Root class="overflow-hidden">
			<div class="grid gap-6 px-8 lg:grid-cols-[1.3fr_1fr] lg:px-12">
				<Card.Header class="flex flex-col justify-center p-0">
					<Card.Title class="text-2xl font-bold lg:text-3xl">Faire un don</Card.Title>
					<Card.Description class="mt-4 text-base leading-relaxed lg:text-lg">
						100 % de vos dons sont utilisés pour les chats : soins, stérilisations, nourriture,
						litière.
					</Card.Description>
					<p class="mt-2 text-muted-foreground">
						Deux façons de nous aider, choisissez celle qui vous convient.
					</p>
				</Card.Header>
				<img
					src="/img/cat$.jpg"
					alt="Chats de l'association"
					class="h-56 w-full rounded-2xl object-cover lg:h-64"
				/>
			</div>
		</Card.Root>

		<!-- LES DEUX FAÇONS DE DONNER -->
		<div class="grid gap-6 md:grid-cols-2">
			{#each WAYS as way (way.site)}
				<Card.Root class="flex flex-col">
					<Card.Header class="gap-4">
						<a
							href={way.href}
							target="_blank"
							rel="noopener noreferrer"
							class="flex h-32 items-center justify-center rounded-2xl bg-muted/40 p-4 transition-opacity hover:opacity-80"
						>
							<img
								src={way.logo}
								alt="{way.cta} (nouvel onglet)"
								class="h-full w-auto object-contain"
							/>
						</a>
						<div class="flex flex-wrap items-center gap-2">
							<Card.Title class="text-xl font-bold lg:text-2xl">{way.title}</Card.Title>
							<Badge class="border-transparent {way.tagClass}">{way.tag}</Badge>
						</div>
					</Card.Header>
					<Card.Content class="flex-1 leading-relaxed text-muted-foreground">
						<p>{way.text}</p>
					</Card.Content>
					<Card.Footer class="justify-end">
						<a
							href={way.href}
							target="_blank"
							rel="noopener noreferrer"
							class={buttonVariants({ size: 'lg' })}
						>
							{way.cta}
							<ExternalLink class="size-4" />
						</a>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</div>
</main>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
