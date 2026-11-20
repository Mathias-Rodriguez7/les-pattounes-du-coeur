<script lang="ts">
	import * as NavigationMenu from '#lib/components/ui/navigation-menu/index.js';
	import * as Sheet from '#lib/components/ui/sheet/index.js';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		Menu,
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
		{ href: '/association/info', label: 'Infos', description: 'Qui sommes-nous ?', icon: Info },
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

	// MOBILE : une barre d'onglets en bas, sous le pouce (comme une appli).
	// Au centre, « Nous soutenir » en médaille surélevée. « Plus » ouvre le reste.
	const isTabActive = (href: string) => isIn(href);
	const MOBILE_TABS = [
		{ href: '/adoptions/chat', match: '/adoptions', label: 'Adopter', icon: Cat },
		{ href: '/agir', match: '/agir', label: 'SOS', icon: Siren }
	];
	const MOBILE_TABS_END = [
		{ href: '/association/news', match: '/association/news', label: 'News', icon: Newspaper }
	];
	// « Plus » : tout le site, rangé par rubrique (les mêmes liens que les sous-menus ordinateur),
	// et tout en bas le chat qui dort pour se connecter
	const AGIR_LINKS: NavLink[] = [
		{
			href: '/agir',
			label: 'Agir',
			description: 'SOS, famille d’accueil, bénévolat',
			icon: Mail
		}
	];
	const moreSections = $derived([
		{ title: 'Adoptions', links: adoptionLinks },
		{ title: 'Nous soutenir', links: SUPPORT_LINKS },
		{ title: 'Association', links: ASSOCIATION_LINKS },
		{ title: 'Agir', links: AGIR_LINKS }
	]);
	// « Plus » est surligné quand on est sur une de ses pages
	const moreActive = $derived(
		!MOBILE_TABS.some((t) => isIn(t.match)) &&
			!isIn('/association/news') &&
			!isIn('/don') &&
			path !== '/'
	);

	const triggerClass = (active: boolean) =>
		`h-10 rounded-full px-4 text-lg font-medium ${
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
				src="/img/cat-sleeping.webp"
				alt=""
				class="w-auto transition-all duration-300 {scrolled ? 'h-9' : 'h-12'}"
			/>
		</button>
	</div>

	<!-- ================= MOBILE : en haut, juste la médaille et le nom ================= -->
	<div
		class="flex h-14 items-center gap-2 rounded-full border border-accent/40 bg-accent/70 px-2 shadow-md backdrop-blur-lg md:hidden"
	>
		<a
			href={resolve('')}
			aria-label="Accueil"
			aria-current={path === '/' ? 'page' : undefined}
			class="flex flex-1 items-center justify-center gap-2"
		>
			<span class="block size-9 shrink-0 rounded-full bg-background p-0.5 ring-2 ring-amber-300">
				<img src="/img/logo.png" alt="" class="size-full rounded-full object-contain" />
			</span>
			<span class="truncate font-semibold">Pattounes du Cœur</span>
		</a>
	</div>
</header>

<!-- ================= MOBILE : la barre d'onglets, en bas ================= -->
<!-- eslint-disable svelte/no-navigation-without-resolve -- liens tirés des listes ci-dessus (dont la boutique, externe) -->
<nav
	aria-label="Navigation principale"
	class="fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 md:hidden"
>
	<ul
		class="grid h-16 grid-cols-5 items-center rounded-full border border-accent/40 bg-accent/80 px-1 shadow-lg backdrop-blur-lg"
	>
		{#snippet tab(item: {
			href: string;
			match: string;
			label: string;
			icon: Component<{ class?: string }>;
		})}
			<li>
				<a
					href={item.href}
					aria-current={isTabActive(item.match) ? 'page' : undefined}
					class="flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors {isTabActive(
						item.match
					)
						? 'text-primary'
						: 'text-foreground/70'}"
				>
					<item.icon class="size-5" />
					{item.label}
				</a>
			</li>
		{/snippet}

		{#each MOBILE_TABS as item (item.href)}{@render tab(item)}{/each}

		<!-- « Nous soutenir » : la médaille, surélevée au centre -->
		<li class="flex justify-center">
			<a
				href={resolve('don')}
				aria-current={isIn('/don') ? 'page' : undefined}
				class="-mt-8 flex flex-col items-center gap-0.5 text-[11px] font-semibold text-primary"
			>
				<span
					class="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-amber-300"
				>
					<Heart class="size-6" />
				</span>
				Soutenir
			</a>
		</li>

		{#each MOBILE_TABS_END as item (item.href)}{@render tab(item)}{/each}

		<!-- « Plus » : le reste du site -->
		<li>
			<Sheet.Root bind:open={mobileMenuOpen}>
				<Sheet.Trigger
					class="flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium {moreActive
						? 'text-primary'
						: 'text-foreground/70'}"
				>
					<Menu class="size-5" />
					Plus
				</Sheet.Trigger>

				<Sheet.Content
					side="bottom"
					class="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-3xl border-0 p-0"
				>
					<Sheet.Title class="flex items-center gap-3 px-5 pt-5 pb-1">
						<img src="/img/logo.png" alt="" class="size-10" />
						<span class="flex flex-col">
							<span class="font-semibold">Pattounes du Cœur</span>
							<span class="text-xs font-normal text-muted-foreground">Association Montpellier</span>
						</span>
					</Sheet.Title>

					<div class="flex flex-col gap-5 p-5 pb-8">
						{#each moreSections as section (section.title)}
							<section aria-labelledby="more-{section.title}">
								<h3
									id="more-{section.title}"
									class="mb-1 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
								>
									{section.title}
								</h3>
								<ul class="flex flex-col">
									{#each section.links as link (link.href + link.label)}
										<li>
											<a
												href={link.href}
												onclick={() => (mobileMenuOpen = false)}
												target={link.external ? '_blank' : undefined}
												rel={link.external ? 'noopener noreferrer' : undefined}
												aria-current={isCurrent(link.href) ? 'page' : undefined}
												class="flex min-h-12 items-center gap-3 rounded-xl px-3 py-1.5 transition-colors hover:bg-accent {isCurrent(
													link.href
												)
													? 'bg-primary/10 text-primary'
													: ''}"
											>
												<link.icon class="size-5 shrink-0 {link.iconClass ?? 'text-primary'}" />
												<span class="flex min-w-0 flex-col">
													<span class="flex items-center gap-1 text-sm font-medium">
														{link.label}
														{#if link.external}<ExternalLink
																class="size-3.5 text-muted-foreground"
															/>{/if}
													</span>
													<span class="truncate text-xs text-muted-foreground">
														{link.description}
													</span>
												</span>
											</a>
										</li>
									{/each}
								</ul>
							</section>
						{/each}

						<!-- Tout en bas : le chat qui dort, pour se connecter -->
						<button
							type="button"
							aria-label="Espace bénévole"
							onclick={() => {
								mobileMenuOpen = false;
								loginOpen = true;
							}}
							class="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-accent p-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50"
						>
							<img src="/img/cat-sleeping.webp" alt="" class="h-10 w-auto" />
						</button>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</li>
	</ul>
</nav>
<!-- eslint-enable svelte/no-navigation-without-resolve -->

<!-- La connexion : la même fenêtre sur ordinateur et sur mobile -->
<Sheet.Root bind:open={loginOpen}>
	<Sheet.Content side="right" class="w-80 sm:w-96">
		<Sheet.Header><Sheet.Title>Espace bénévole</Sheet.Title></Sheet.Header>
		<div class="mt-6 px-4">
			<LoginForm onForgotPassword={() => (loginOpen = false)} buttonClass="h-12 w-full text-lg" />
		</div>
	</Sheet.Content>
</Sheet.Root>
