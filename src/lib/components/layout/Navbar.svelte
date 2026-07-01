<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		Menu,
		Home,
		Heart,
		FileText,
		Info,
		Newspaper,
		BookOpen,
		ShoppingBag,
		Mail
	} from '@lucide/svelte';

	let mobileMenuOpen = $state(false);
</script>

<header
	class="bg-accent/70 border-accent/40 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur-lg"
>
	<!-- ================= MOBILE ================= -->
	<div class="flex items-center justify-between px-4 md:hidden">
		<!-- Burger -->
		<Sheet.Root bind:open={mobileMenuOpen}>
			<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
				<Menu class="h-6 w-6" />
			</Sheet.Trigger>

			<Sheet.Content
				side="left"
				class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left w-90 p-0 duration-300"
			>
				<!-- Header du drawer -->
				<div class="bg-accent/50 flex items-center gap-3 border-b px-5 py-4">
					<img src="/img/logo.png" alt="logo" class="h-10 w-10" />
					<div>
						<p class="font-semibold">Pattounes du Cœur</p>
						<p class="text-muted-foreground text-xs">Association Montpellier</p>
					</div>
				</div>

				<nav class="flex flex-col gap-1 p-6">
					<!-- Accueil -->
					<a
						href={resolve('/')}
						onclick={() => (mobileMenuOpen = false)}
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                {page.url.pathname === '/' ? 'bg-accent font-semibold' : ''}"
					>
						<Home class="h-4 w-4 shrink-0" />
						Accueil
					</a>

					<!-- Séparateur -->
					<p
						class="text-muted-foreground mt-3 mb-1 px-3 text-xs font-semibold tracking-wider uppercase"
					>
						Adoptions
					</p>

					<a
						href={resolve('/adoptions/chat')}
						onclick={() => (mobileMenuOpen = false)}
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                {page.url.pathname === '/adoptions/chat' ? 'bg-accent font-semibold' : ''}"
					>
						<Heart class="h-4 w-4 shrink-0" />
						Nos chats
					</a>

					<a
						href={resolve('/adoptions/formChat')}
						onclick={() => (mobileMenuOpen = false)}
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                {page.url.pathname === '/adoptions/formChat' ? 'bg-accent font-semibold' : ''}"
					>
						<FileText class="h-4 w-4 shrink-0" />
						Formulaire d'adoption
					</a>

					<a
						href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
						onclick={() => (mobileMenuOpen = false)}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
					>
						<Heart class="h-4 w-4 shrink-0 text-rose-500" />
						Faire un don
					</a>

					<!-- Séparateur -->
					<p
						class="text-muted-foreground mt-3 mb-1 px-3 text-xs font-semibold tracking-wider uppercase"
					>
						Association
					</p>

					<a
						href={resolve('/association/info')}
						onclick={() => (mobileMenuOpen = false)}
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                {page.url.pathname === '/association/info' ? 'bg-accent font-semibold' : ''}"
					>
						<Info class="h-4 w-4 shrink-0" />
						Infos
					</a>

					<a
						href={resolve('/association/news')}
						onclick={() => (mobileMenuOpen = false)}
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                {page.url.pathname === '/association/news' ? 'bg-accent font-semibold' : ''}"
					>
						<Newspaper class="h-4 w-4 shrink-0" />
						News
					</a>

					<a
						href={resolve('/association/conseils')}
						onclick={() => (mobileMenuOpen = false)}
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                {page.url.pathname === '/association/conseils' ? 'bg-accent font-semibold' : ''}"
					>
						<BookOpen class="h-4 w-4 shrink-0" />
						Conseils
					</a>

					<!-- Boutique désactivée -->
					<button
						disabled
						class="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-50"
					>
						<ShoppingBag class="h-4 w-4 shrink-0" />
						Boutique
						<span class="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">
							Bientôt
						</span>
					</button>

					<!-- Séparateur -->
					<div class="my-2 border-t"></div>

					<a
						href={resolve('/agir')}
						onclick={() => (mobileMenuOpen = false)}
						class="hover:bg-accent flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                {page.url.pathname === '/agir' ? 'bg-accent font-semibold' : ''}"
					>
						<Mail class="h-4 w-4 shrink-0" />
						Agir
					</a>
				</nav>
			</Sheet.Content>
		</Sheet.Root>

		<!-- Logo -->
		<img src="/img/logo.png" alt="logo" class="h-12 w-12" />

		<!-- Login Sheet -->
		<Sheet.Root>
			<Sheet.Trigger>
				<img src="/img/cat-sleeping.png" alt="login" class="h-10 w-10" />
			</Sheet.Trigger>

			<Sheet.Content side="right" class="w-80">
				<Sheet.Header>
					<Sheet.Title>Connexion</Sheet.Title>
				</Sheet.Header>

				<form method="POST" action="/login" class="mt-6 grid gap-4 px-4">
					<div class="grid gap-2">
						<Label>Email</Label>
						<Input name="email" type="email" required />
					</div>

					<div class="grid gap-2">
						<Label>Mot de passe</Label>
						<Input name="password" type="password" required />
					</div>

					<Button type="submit" class="w-full">Connexion</Button>
				</form>
			</Sheet.Content>
		</Sheet.Root>
	</div>

	<!-- ================= DESKTOP ================= -->
	<div class="hidden w-full items-center px-5 md:flex">
		<!-- Logo -->
		<a
			href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
			target="_blank"
			rel="noopener noreferrer"
		>
			<img src="/img/hear_paw.png" alt="logo" class="h-15 w-15" />
		</a>

		<!-- NAV CENTER -->
		<div class="flex min-w-0 flex-1 justify-center">
			<NavigationMenu.Root viewport={false}>
				<NavigationMenu.List class="flex items-center gap-6">
					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="text-2xl">Adoptions</NavigationMenu.Trigger>
						<NavigationMenu.Content class="shadow-md">
							<ul class="grid w-52 gap-2 p-3">
								<li>
									<NavigationMenu.Link href="/adoptions/chat" class="text-2xl"
										>Chats</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="/adoptions/formChat" class="text-2xl"
										>Formulaire</NavigationMenu.Link
									>
								</li>
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link
							href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
							target="_blank"
							class="text-2xl">Donation</NavigationMenu.Link
						>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link href="/">
							<img src="/img/logo.png" alt="logo" class="h-20 w-20" />
						</NavigationMenu.Link>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="text-2xl">Association</NavigationMenu.Trigger>
						<NavigationMenu.Content class="shadow-md">
							<ul class="grid w-52 gap-2 p-3">
								<li>
									<NavigationMenu.Link href="/association/info" class="text-2xl"
										>Info</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="/association/news" class="text-2xl"
										>News</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="/association/conseils" class="text-2xl"
										>Conseils</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="#" class="text-2xl">Boutique</NavigationMenu.Link>
								</li>
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link href="/agir" class="text-2xl">Agir</NavigationMenu.Link>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>

		<!-- LOGIN DESKTOP -->
		<Sheet.Root>
			<Sheet.Trigger class={buttonVariants}>
				<img src="/img/cat-sleeping.png" alt="login" class="h-20 w-20" />
			</Sheet.Trigger>

			<Sheet.Content side="right" class="w-96">
				<Sheet.Header>
					<Sheet.Title>Connexion</Sheet.Title>
				</Sheet.Header>

				<form method="POST" action="/login" class="mt-6 grid gap-4 px-4">
					<div class="grid gap-2">
						<Label>Email</Label>
						<Input name="email" type="email" required />
					</div>

					<div class="grid gap-2">
						<Label>Mot de passe</Label>
						<Input name="password" type="password" required />
					</div>

					<Button type="submit" class="h-12 w-full text-xl">Connexion</Button>
				</form>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</header>
