<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { ExternalLink, Mail } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { HELLOASSO_URL, TEAMING_URL } from '#lib/constants/donation.ts';
	import { CONTACT_EMAIL } from '#lib/constants/contact.ts';

	// Deux plateformes de dons, présentées sans les classer : le visiteur choisit.
	// Le logo ET le bouton ouvrent le site : beaucoup ne pensent pas à cliquer sur une image
	const DONATIONS = [
		{
			name: 'HelloAsso',
			text: 'Un don unique ou tous les mois, du montant de votre choix, par carte bancaire.',
			href: HELLOASSO_URL,
			logo: '/img/helloasso.png',
			cta: 'Donner sur HelloAsso'
		},
		{
			name: 'Teaming',
			text: 'Rejoignez notre groupe : 1 € par mois, sans engagement. Petit pour vous, précieux pour nous : vos dons réguliers nous permettent de prévoir les soins.',
			href: TEAMING_URL,
			logo: '/img/teaming.png',
			cta: 'Rejoindre sur Teaming'
		}
	];

	// Partenariat SAFTI : l'asso transmet le projet à l'agence, qui reverse une partie de ses honoraires
	const SAFTI_STEPS = [
		{
			title: 'Écrivez-nous',
			text: 'Par mail : vos coordonnées et votre projet (achat ou vente, vos critères).'
		},
		{
			title: 'SAFTI vous recontacte',
			text: "Nous transmettons vos informations à l'agence SAFTI, qui vous rappelle."
		},
		{
			title: 'Les chats y gagnent',
			text: "Si l'achat ou la vente se fait avec SAFTI, 10 % de leurs honoraires sont reversés à l'asso, avec un minimum de 835 €."
		}
	];

	// Le mail s'ouvre déjà rempli : l'asso reçoit tout ce qu'il faut pour transmettre à SAFTI
	const SAFTI_SUBJECT = 'Projet immobilier – partenariat SAFTI';
	const SAFTI_BODY = [
		'Bonjour,',
		'',
		"J'ai un projet immobilier et je souhaite passer par le partenariat SAFTI des Pattounes du Cœur.",
		'',
		'Nom et prénom :',
		'Téléphone :',
		'Projet (achat ou vente) :',
		'Ville / secteur :',
		'Critères ou informations sur le bien :',
		'',
		'Merci !'
	].join('\n');
	const saftiMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SAFTI_SUBJECT)}&body=${encodeURIComponent(SAFTI_BODY)}`;
</script>

<svelte:head>
	<title>Nous soutenir – Les Pattounes du Cœur</title>
</svelte:head>

<!-- eslint-disable svelte/no-navigation-without-resolve -- HelloAsso, Teaming et mailto : pas des routes -->
<main in:fade={{ duration: 200 }} class="flex justify-center px-4 py-8">
	<div in:fly={{ y: 20, duration: 300 }} class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<!-- EN-TÊTE -->
		<Card.Root class="overflow-hidden">
			<div class="grid gap-6 px-8 lg:grid-cols-[1.3fr_1fr] lg:px-12">
				<Card.Header class="flex flex-col justify-center p-0">
					<Card.Title class="text-2xl font-bold lg:text-3xl">Nous soutenir</Card.Title>
					<Card.Description class="mt-4 text-base leading-relaxed lg:text-lg">
						100 % de ce que vous nous donnez va aux chats : opérations, stérilisations, nourriture,
						matériel.
					</Card.Description>
				</Card.Header>
				<img
					src="/img/cat$.jpg"
					alt="Chats de l'association"
					class="h-56 w-full rounded-2xl object-cover lg:h-64"
				/>
			</div>
		</Card.Root>

		<!-- FAIRE UN DON -->
		<section class="flex flex-col gap-4" aria-labelledby="dons-title">
			<h2 id="dons-title" class="text-xl font-bold lg:text-2xl">Faire un don</h2>
			<div class="grid gap-6 md:grid-cols-2">
				{#each DONATIONS as donation (donation.name)}
					<Card.Root class="flex flex-col">
						<Card.Header class="gap-4">
							<a
								href={donation.href}
								target="_blank"
								rel="noopener noreferrer"
								class="flex h-32 items-center justify-center rounded-2xl bg-muted/40 p-4 transition-opacity hover:opacity-80"
							>
								<img
									src={donation.logo}
									alt="{donation.cta} (nouvel onglet)"
									class="h-full w-auto object-contain"
								/>
							</a>
							<Card.Title class="text-xl font-bold lg:text-2xl">{donation.name}</Card.Title>
						</Card.Header>
						<Card.Content class="flex-1 leading-relaxed text-muted-foreground">
							<p>{donation.text}</p>
						</Card.Content>
						<Card.Footer class="justify-end">
							<a
								href={donation.href}
								target="_blank"
								rel="noopener noreferrer"
								class={buttonVariants({ size: 'lg' })}
							>
								{donation.cta}
								<ExternalLink class="size-4" />
							</a>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		</section>

		<!-- PARTENARIAT SAFTI : à part, ce n'est pas un don (id : lien direct depuis l'accueil) -->
		<section id="safti" class="scroll-mt-24" aria-labelledby="safti-title">
			<Card.Root class="border-2 border-orange-300">
				<Card.Header class="flex flex-row items-center gap-4">
					<img src="/img/partners/safti.png" alt="SAFTI" class="h-16 w-auto shrink-0" />
					<div class="flex flex-col gap-1">
						<h2 id="safti-title" class="text-xl font-bold lg:text-2xl">
							Vous achetez ou vendez un bien immobilier ?
						</h2>
						<p class="text-muted-foreground">
							Notre partenaire SAFTI reverse une partie de ses honoraires à l'asso.
						</p>
					</div>
				</Card.Header>

				<Card.Content>
					<ol class="grid gap-4 md:grid-cols-3">
						{#each SAFTI_STEPS as step, i (step.title)}
							<li class="flex flex-col gap-2 rounded-2xl bg-orange-50 p-4">
								<span class="flex items-center gap-2 font-semibold text-orange-800">
									<span
										class="flex size-7 items-center justify-center rounded-full bg-orange-500 text-sm text-white"
									>
										{i + 1}
									</span>
									{step.title}
								</span>
								<p class="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
							</li>
						{/each}
					</ol>
				</Card.Content>

				<Card.Footer class="flex flex-wrap items-center justify-between gap-4">
					<p class="text-sm text-muted-foreground">
						Cet argent finance des opérations, des stérilisations et du matériel.
					</p>
					<a href={saftiMailto} class={buttonVariants({ size: 'lg' })}>
						<Mail class="size-4" />
						Nous parler de mon projet
					</a>
				</Card.Footer>
			</Card.Root>
		</section>
	</div>
</main>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
