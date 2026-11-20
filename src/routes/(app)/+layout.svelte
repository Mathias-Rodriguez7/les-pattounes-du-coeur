<script lang="ts">
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Sidebar from '#lib/components/layout/Sidebar.svelte';
	import DashboardMobileNav from '#lib/components/layout/DashboardMobileNav.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import NavigationProgress from '#lib/components/feedback/NavigationProgress.svelte';
	import { Toaster } from 'svelte-sonner';
	import '../../app.css';

	const { data, children } = $props();

	// Les pastilles « à faire » de la sidebar (calculées par le layout serveur)
	const badges = $derived({
		// Ses adoptions à finaliser, et les chats à publier (admin, communication)
		'dashboard/chat': data.dueAdoptionsCount + data.catsToPublishCount,
		'dashboard/sos': data.newSosCount
	} as const);
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<!-- Une fine barre en haut pendant le chargement d'une page -->
<NavigationProgress />

{#if data.user}
	<!-- ================= DASHBOARD ================= -->
	<div class="flex h-dvh overflow-hidden">
		<!-- Sidebar fixe : ordinateur uniquement -->
		<div class="hidden shrink-0 lg:block"><Sidebar user={data.user} {badges} /></div>

		<div class="flex min-w-0 flex-1 flex-col">
			<!-- Téléphone et tablette : pilule en haut, barre d'onglets en bas (comme le site public) -->
			<DashboardMobileNav user={data.user} {badges} />

			<!-- Contenu : la seule zone qui défile -->
			<!-- pb (mobile) : la barre d'onglets en bas ne cache pas la fin de la page -->
			<div class="flex-1 overflow-y-auto pb-24 lg:pb-0">
				{@render children()}
			</div>
		</div>
	</div>
{:else}
	<!-- ================= PUBLIC ================= -->
	<!-- Le contenu (flex-1) prend toute la place libre : sur une page courte,
	     le footer reste collé en bas de l'écran au lieu de laisser un vide sous lui.
	     dvh : la hauteur réellement visible sur mobile (barres du navigateur comprises) -->
	<!-- pb (mobile) : la barre d'onglets en bas ne cache pas le pied de page -->
	<div class="flex min-h-dvh flex-col pb-24 md:pb-0">
		<Navbar adoptableCatsCount={data.adoptableCatsCount} />

		<!-- id : la cible du lien « Aller au contenu » (clavier) -->
		<div id="contenu" tabindex="-1" class="flex-1 outline-none">
			{@render children()}
		</div>

		<Footer />
	</div>
{/if}

<Toaster />
