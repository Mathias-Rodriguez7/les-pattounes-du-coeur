<script lang="ts">
	import * as NavigationMenu from '#lib/components/ui/navigation-menu/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
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
		Mail,
		House,
		HeartHandshake,
		Cat,
		Siren,
		ExternalLink
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import LoginForm from '#lib/components/auth/LoginForm.svelte';

	// LE COLLIER : la barre est un collier de chat, le logo est sa médaille qui pend dessous.
	// En défilant, la médaille remonte se ranger dans le collier (qui s'affine).
	// La connexion reste cachée : c'est le chat qui dort, à droite.

	/** Les chats visibles et disponibles : affichés dans le sous-menu « Adoptions » */
	let { adoptableCatsCount = 0 }: { adoptableCatsCount?: number } = $props();

	let mobileMenuOpen = $state(false);
	let loginOpen = $state(false);

	// Ferme tous les menus à chaque changement de page
	afterNavigate(({ shallow, type }) => {
		if (shallow && type === 'goto') return;
		mobileMenuOpen = false;
		loginOpen = false;
	});

	// La médaille remonte dès qu'on a un peu défilé
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 24);

	// La rubrique en cours est surlignée
	const path = $derived(page.url.pathname);
	const isIn = (prefix: string) => path === prefix || path.startsWith(`${prefix}/`);
	const isCurrent = (href: string) => !href.startsWith('http') && path === href.split('#')[0];

	interface NavLink {
		href: string;
		label: string;
		description: string;
		icon: Component<{ class?: string }>;
		iconClass?: string;
		external?: boolean;
	}

	const adoptionLinks = $derived<NavLink[]>([
		{
			href: '/adoptions/chat',
			label: 'Chats à adopter',
			description:
				adoptableCatsCount > 1
					? `${adoptableCatsCount} chats attendent une famille`
					: adoptableCatsCount === 1
						? '1 chat attend une famille'
						: 'Nos chats à l’adoption',
			icon: Cat
		},
		{
			href: '/adoptions/formChat',
			label: 'Formulaire d’adoption',
			description: 'Pour un chat précis ou en général',
			icon: FileText
		}
	]);
	const SUPPORT_LINKS: NavLink[] = [
		{
			href: '/don',
			label: 'Faire un don',
			description: 'HelloAsso ou Teaming',
			icon: HeartHandshake
		},
		{
			href: '/don#safti',
			label: 'Projet immobilier',
			description: 'Avec SAFTI, au moins 835 € pour les chats',
			icon: House,
			iconClass: 'text-orange-500'
		}
	];
	const ASSOCIATION_LINKS: NavLink[] = [
		{ href: '/association/info', label: 'Infos', description: 'Qui sommes-nous', icon: Info },
		{
			href: '/association/news',
			label: 'News',
			description: 'Les dernières nouvelles',
			icon: Newspaper
		},
		{
			href: '/association/conseils',
			label: 'Conseils',
			description: 'Bien vivre avec son chat',
			icon: BookOpen
		},
		{
			href: 'https://www.creapourtoi.fr/boutique/',
			label: 'Boutique',
			description: 'Créa pour toi, au profit de l’asso',
			icon: ShoppingBag,
			external: true
		}
	];

	// Mobile : les actions principales en grandes tuiles, le reste en liste
	const MOBILE_TILES = [
		{ href: '/adoptions/chat', label: 'Chats à adopter', icon: Cat },
		{ href: '/agir', label: 'Signaler un SOS', icon: Siren, iconClass: 'text-orange-500' },
		{ href: '/agir', label: 'Famille d’accueil', icon: Home },
		{ href: '/association/news', label: 'News', icon: Newspaper }
	];
	const mobileLinks = $derived<NavLink[]>([
		{ href: '/', label: 'Accueil', description: '', icon: Home },
		adoptionLinks[1],
		...SUPPORT_LINKS,
		ASSOCIATION_LINKS[0],
		ASSOCIATION_LINKS[2],
		ASSOCIATION_LINKS[3],
		{ href: '/agir', label: 'Agir', description: '', icon: Mail }
	]);

	const triggerClass = (active: boolean) =>
		`h-10 rounded-full px-4 text-base font-lg ${
			active ? 'bg-primary/10 text-primary hover:bg-primary/15 focus:bg-primary/15' : ''
		}`;
</script>

<svelte:window bind:scrollY />

{#snippet dropdownItem(link: NavLink)}
	<li>
		<NavigationMenu.Link
			href={link.href}
			active={isCurrent(link.href)}
			target={link.external ? '_blank' : undefined}
			rel={link.external ? 'noopener noreferrer' : undefined}
			class="flex flex-row items-start gap-3 rounded-lg px-3 py-2.5"
		>
			<link.icon class="mt-0.5 size-5 shrink-0 {link.iconClass ?? 'text-primary'}" />
			<span class="flex flex-col gap-0.5">
				<span class="flex items-center gap-1 text-base">
					{link.label}
					{#if link.external}<ExternalLink class="size-3.5 text-muted-foreground" />{/if}
				</span>
				<span class="text-xs font-normal text-muted-foreground">{link.description}</span>
			</span>
		</NavigationMenu.Link>
	</li>
{/snippet}

<!-- Clavier : on peut sauter directement au contenu (invisible sauf au focus) -->
<a
	href="#contenu"
	class="sr-only rounded-md bg-background px-4 py-2 font-medium shadow-md focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60"
>
	Aller au contenu
</a>

<!-- Le collier flotte : il ne touche pas les bords, ses extrémités sont arrondies -->
<header class="sticky top-0 z-50 w-full px-3 pt-2 md:px-6 md:pt-3">
	<!-- ================= LE COLLIER (ordinateur) ================= -->
	<div
		class="relative hidden rounded-full border border-accent/40 bg-accent/70 shadow-md backdrop-blur-lg transition-[height] duration-300 md:block {scrolled
			? 'h-12'
			: 'h-16'}"
	>
		<!-- Trois colonnes : la médaille est TOUJOURS au centre exact, entre les deux moitiés du menu -->
		<div class="grid h-full grid-cols-[1fr_auto_1fr] items-center">
			<NavigationMenu.Root viewport={false} class="justify-self-end">
				<NavigationMenu.List class="flex items-center gap-2">
					<NavigationMenu.Item>
						<NavigationMenu.Trigger class={triggerClass(isIn('/adoptions'))}>
							Adoptions
						</NavigationMenu.Trigger>
						<NavigationMenu.Content class="shadow-md">
							<ul class="grid w-80 gap-1 p-1">
								{#each adoptionLinks as link (link.href)}{@render dropdownItem(link)}{/each}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<!-- « Nous soutenir » : le bouton plein, toujours visible -->
					<NavigationMenu.Item>
						<NavigationMenu.Trigger
							class="h-10 rounded-full bg-primary px-4 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground data-open:bg-primary/90 data-open:hover:bg-primary/90 data-open:focus:bg-primary/90 data-popup-open:bg-primary/90 data-popup-open:hover:bg-primary/90"
						>
							<Heart class="mr-1.5 size-4" />
							Nous soutenir
						</NavigationMenu.Trigger>
						<NavigationMenu.Content class="shadow-md">
							<ul class="grid w-80 gap-1 p-1">
								{#each SUPPORT_LINKS as link (link.href)}{@render dropdownItem(link)}{/each}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>

			<!-- LA MÉDAILLE : accrochée au collier par un anneau, elle pend en dessous ;
			     en défilant, elle remonte se ranger dans le collier -->
			<div class="relative mx-6 h-full w-24">
				<a
					href={resolve('')}
					aria-label="Accueil"
					aria-current={path === '/' ? 'page' : undefined}
					class="group absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center transition-all duration-300 {scrolled
						? 'top-1'
						: 'top-[calc(100%-1.75rem)]'}"
				>
					<!-- L'anneau -->
					<span
						aria-hidden="true"
						class="-mb-1.5 size-4 rounded-full border-[3px] border-amber-400 transition-opacity duration-300 {scrolled
							? 'h-0 opacity-0'
							: 'opacity-100'}"
					></span>
					<span
						class="rounded-full bg-background p-1 shadow-md ring-4 ring-amber-300 transition-all duration-300 group-hover:ring-amber-400 {scrolled
							? 'size-10'
							: 'size-16 group-hover:rotate-6'}"
					>
						<img src="/img/logo.png" alt="" class="size-full rounded-full object-contain" />
					</span>
				</a>
			</div>

			<NavigationMenu.Root viewport={false} class="justify-self-start">
				<NavigationMenu.List class="flex items-center gap-2">
					<NavigationMenu.Item>
						<NavigationMenu.Trigger class={triggerClass(isIn('/association'))}>
							Association
						</NavigationMenu.Trigger>
						<NavigationMenu.Content class="shadow-md">
							<ul class="grid w-80 gap-1 p-1">
								{#each ASSOCIATION_LINKS as link (link.href)}{@render dropdownItem(link)}{/each}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link
							href="/agir"
							active={isIn('/agir')}
							class="h-10 justify-center rounded-full px-4 text-base font-medium {isIn('/agir')
								? 'bg-primary/10 text-primary'
								: ''}"
						>
							Agir
						</NavigationMenu.Link>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>

		<!-- Le chat qui dort : la connexion (cachée, mais il se réveille un peu au survol) -->
		<button
			type="button"
			onclick={() => (loginOpen = true)}
			aria-label="Espace bénévole"
			title="Psst… espace bénévole"
			class="absolute top-1/2 right-6 -translate-y-1/2 transition-transform duration-300 hover:scale-110 hover:-rotate-6 focus-visible:scale-110 focus-visible:-rotate-6"
		>
			<img
				src="/img/cat-sleeping.png"
				alt=""
				class="w-auto transition-all duration-300 {scrolled ? 'h-9' : 'h-12'}"
			/>
		</button>
	</div>

	<!-- ================= MOBILE ================= -->
	<div
		class="flex h-14 items-center gap-2 rounded-full border border-accent/40 bg-accent/70 px-2 shadow-md backdrop-blur-lg md:hidden"
	>
		<a href={resolve('')} aria-label="Accueil" class="shrink-0">
			<span class="block size-10 rounded-full bg-background p-0.5 ring-2 ring-amber-300">
				<img src="/img/logo.png" alt="" class="size-full rounded-full object-contain" />
			</span>
		</a>

		<span class="flex-1"></span>

		<a
			href={resolve('don')}
			class="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm"
		>
			<Heart class="size-4" />
			Soutenir
		</a>

		<button
			type="button"
			onclick={() => (loginOpen = true)}
			aria-label="Espace bénévole"
			class="flex size-11 items-center justify-center"
		>
			<img src="/img/cat-sleeping.png" alt="" class="h-8 w-auto" />
		</button>

		<!-- Le menu : à droite, sous le pouce -->
		<Sheet.Root bind:open={mobileMenuOpen}>
			<Sheet.Trigger
				class="{buttonVariants({ variant: 'ghost', size: 'icon' })} size-11"
				aria-label="Ouvrir le menu"
			>
				<Menu class="size-6" />
			</Sheet.Trigger>

			<Sheet.Content side="right" class="w-full max-w-90 gap-0 overflow-y-auto p-0">
				<Sheet.Title class="flex items-center gap-3 border-b bg-accent/50 px-5 py-4">
					<img src="/img/logo.png" alt="" class="size-10" />
					<span class="flex flex-col">
						<span class="font-semibold">Pattounes du Cœur</span>
						<span class="text-xs font-normal text-muted-foreground">Association Montpellier</span>
					</span>
				</Sheet.Title>

				<!-- eslint-disable svelte/no-navigation-without-resolve -- liens tirés des listes ci-dessus (dont la boutique, externe) -->
				<nav class="flex flex-col gap-4 p-5">
					<!-- Les actions principales -->
					<div class="grid grid-cols-2 gap-2">
						{#each MOBILE_TILES as tile (tile.label)}
							<a
								href={tile.href}
								onclick={() => (mobileMenuOpen = false)}
								class="flex min-h-20 flex-col justify-between gap-2 rounded-2xl bg-accent/50 p-3 text-sm font-medium transition-colors hover:bg-accent"
							>
								<tile.icon class="size-6 {tile.iconClass ?? 'text-primary'}" />
								{tile.label}
							</a>
						{/each}
					</div>

					<!-- Le reste -->
					<ul class="flex flex-col">
						{#each mobileLinks as link (link.href + link.label)}
							<li>
								<a
									href={link.href}
									onclick={() => (mobileMenuOpen = false)}
									target={link.external ? '_blank' : undefined}
									rel={link.external ? 'noopener noreferrer' : undefined}
									aria-current={isCurrent(link.href) ? 'page' : undefined}
									class="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-accent {isCurrent(
										link.href
									)
										? 'bg-primary/10 text-primary'
										: ''}"
								>
									<link.icon class="size-4 shrink-0 {link.iconClass ?? 'text-muted-foreground'}" />
									{link.label}
									{#if link.external}<ExternalLink class="size-3.5 text-muted-foreground" />{/if}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</Sheet.Content>
		</Sheet.Root>
	</div>
</header>

<!-- La connexion : la même fenêtre sur ordinateur et sur mobile -->
<Sheet.Root bind:open={loginOpen}>
	<Sheet.Content side="right" class="w-80 sm:w-96">
		<Sheet.Header><Sheet.Title>Espace bénévole</Sheet.Title></Sheet.Header>
		<div class="mt-6 px-4">
			<LoginForm onForgotPassword={() => (loginOpen = false)} buttonClass="h-12 w-full text-lg" />
		</div>
	</Sheet.Content>
</Sheet.Root>
