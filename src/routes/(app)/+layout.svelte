<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { afterNavigate } from '$app/navigation';
	import { Menu } from '@lucide/svelte';
	import { Toaster } from 'svelte-sonner';
	import '../../app.css';

	const { data, children } = $props();

	let mobileMenuOpen = $state(false);

	// Sécurité : ferme le tiroir après chaque navigation (bouton retour, redirection…)
	afterNavigate(() => {
		mobileMenuOpen = false;
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

{#if data.user}
	<!-- ================= DASHBOARD ================= -->
	<div class="flex h-dvh overflow-hidden">
		<!-- Sidebar fixe : ordinateur uniquement -->
		<div class="hidden shrink-0 lg:block">
			<Sidebar user={data.user} />
		</div>

		<div class="flex min-w-0 flex-1 flex-col">
			<!-- Barre du haut : téléphone et tablette uniquement -->
			<header
				class="bg-accent/70 border-accent/40 flex shrink-0 items-center gap-3 border-b px-3 py-2 backdrop-blur-lg lg:hidden"
			>
				<Sheet.Root bind:open={mobileMenuOpen}>
					<Sheet.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon' })}
						aria-label="Ouvrir le menu"
					>
						<Menu class="size-6" />
					</Sheet.Trigger>

					<Sheet.Content side="left" class="w-72 p-0">
						<!-- Titre invisible, obligatoire pour l'accessibilité des fenêtres -->
						<Sheet.Title class="sr-only">Menu de navigation</Sheet.Title>
						<Sidebar user={data.user} mobile onClose={() => (mobileMenuOpen = false)} />
					</Sheet.Content>
				</Sheet.Root>

				<img src="/img/logo.png" alt="" class="size-9" />
				<span class="truncate font-semibold">Les Pattounes du Cœur</span>
			</header>

			<!-- Contenu : la seule zone qui défile -->
			<div class="flex-1 overflow-y-auto">
				{@render children()}
			</div>
		</div>
	</div>
{:else}
	<!-- ================= PUBLIC ================= -->
	<div class="flex min-h-screen flex-col">
		<Navbar />

		<div class="flex-1">
			{@render children()}

			<Footer />
		</div>
	</div>
{/if}

<Toaster />
