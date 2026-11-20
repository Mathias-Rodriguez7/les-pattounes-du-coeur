<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { ArrowLeft, Home, LayoutDashboard } from '@lucide/svelte';

	// La page d'erreur, aux couleurs de l'asso : un message clair selon le code,
	// et deux portes de sortie (retour, accueil ou dashboard si on est connectée)

	const status = $derived(page.status);
	const loggedIn = $derived(!!page.data?.user);

	const content = $derived.by(() => {
		if (status === 404)
			return {
				title: 'Ce chat s’est caché…',
				text: 'La page que vous cherchez n’existe pas, ou elle a déménagé.'
			};
		if (status === 401 || status === 403)
			return {
				title: 'Accès réservé',
				text: page.error?.message || 'Cette page est réservée aux bénévoles de l’association.'
			};
		if (status >= 400 && status < 500)
			return {
				title: 'Cette demande n’a pas abouti',
				text: page.error?.message || 'Vérifiez l’adresse ou réessayez.'
			};
		return {
			title: 'Oups, quelque chose s’est mal passé',
			text: 'Ce n’est pas de votre faute. Réessayez dans un instant ; si le problème continue, écrivez-nous.'
		};
	});
</script>

<svelte:head>
	<title>{content.title} – Les Pattounes du Cœur</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="flex min-h-[60dvh] items-center justify-center px-4 py-12">
	<div class="flex max-w-md flex-col items-center gap-5 text-center">
		<img src="/img/leegloo-chat-soutenir.webp" alt="" width="280" height="282" class="w-36" />
		<p class="text-sm font-semibold tracking-wider text-primary">Erreur {status}</p>
		<h1 class="text-2xl font-bold sm:text-3xl">{content.title}</h1>
		<p class="text-muted-foreground">{content.text}</p>

		<div class="flex flex-wrap justify-center gap-3">
			<button
				type="button"
				onclick={() => history.back()}
				class="{buttonVariants({ variant: 'outline' })} rounded-full"
			>
				<ArrowLeft class="size-4" />
				Retour
			</button>
			{#if loggedIn}
				<a href={resolve('dashboard')} class="{buttonVariants()} rounded-full">
					<LayoutDashboard class="size-4" />
					Mon dashboard
				</a>
			{:else}
				<a href={resolve('')} class="{buttonVariants()} rounded-full">
					<Home class="size-4" />
					Accueil
				</a>
			{/if}
		</div>
	</div>
</main>
