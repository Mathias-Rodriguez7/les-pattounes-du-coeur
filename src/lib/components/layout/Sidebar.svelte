<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { Path } from '$app/types';
	import type { VolunteerRole } from '@prisma/client';
	import type { AppUser } from '#lib/types/user.ts';
	import { VOLUNTEER_ROLE_OPTIONS } from '#lib/constants/volunteer.ts';
	import {
		LayoutDashboard,
		Cat,
		HouseHeart,
		Users,
		LogOut,
		ChevronLeft,
		ChevronRight,
		Newspaper,
		ClipboardList,
		FileQuestionMark,
		Ban
	} from '@lucide/svelte';

	type Props = {
		user: AppUser;
		/** Affichage dans le tiroir mobile : pleine largeur, jamais repliée */
		mobile?: boolean;
		/** Appelé au clic sur un lien (ex : fermer le tiroir mobile) */
		onClose?: () => void;
		/** Pastilles « à faire » par lien, ex : { 'dashboard/chat': 2 } (0 ou absent = rien) */
		badges?: Partial<Record<Path, number>>;
	};

	let { user, mobile = false, onClose, badges = {} }: Props = $props();

	// Sur mobile, la sidebar n'est jamais repliée
	let collapsedState = $state(false);
	const collapsed = $derived(!mobile && collapsedState);

	type NavItem = {
		label: string;
		icon: typeof LayoutDashboard;
		href: Path;
		roles: VolunteerRole[];
	};

	const allItems: NavItem[] = [
		{
			label: 'Dashboard',
			icon: LayoutDashboard,
			href: 'dashboard',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: 'Chats',
			icon: Cat,
			href: 'dashboard/chat',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: "Familles d'accueil",
			icon: HouseHeart,
			href: 'dashboard/famille_d_accueil',
			roles: ['ADMIN']
		},

		{
			label: 'Bénévoles',
			icon: Users,
			href: 'dashboard/benevole',
			roles: ['ADMIN']
		},

		{
			label: 'News',
			icon: Newspaper,
			href: 'dashboard/news',
			roles: ['ADMIN', 'COMMUNICATION']
		},

		{
			label: 'Formulaires',
			icon: ClipboardList,
			href: 'dashboard/forms',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: 'Blacklist',
			icon: Ban,
			href: 'dashboard/blacklist',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: 'Documents',
			icon: FileQuestionMark,
			href: 'dashboard/information',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		}
	];

	const profileHref: Path = 'dashboard/profil';

	const items = $derived(allItems.filter((item) => item.roles.includes(user.role)));
	const initials = $derived(`${user.profil.firstName[0]}${user.profil.lastName[0]}`.toUpperCase());
	const roleLabel = $derived(
		VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === user.role)?.label ?? user.role
	);

	// Actif aussi sur les sous-pages (/dashboard/chat/123), sauf pour /dashboard lui-même
	// SK3 : un Path n'a plus de « / » au début ('dashboard/chat'), alors que l'URL en a un.
	// On compare donc avec resolve(href), qui donne la vraie URL ('/dashboard/chat').
	function isActive(href: Path): boolean {
		const path = page.url.pathname;
		const target = resolve(href);
		return href === 'dashboard'
			? path === target
			: path === target || path.startsWith(`${target}/`);
	}
</script>

<aside
	class="relative flex flex-col border-accent/40 bg-accent/70 backdrop-blur-lg transition-all duration-300 ease-in-out
	{mobile ? 'h-full w-full' : `h-dvh border-r ${collapsed ? 'w-18' : 'w-45'}`}"
>
	<!-- Bouton replier / déplier : uniquement sur ordinateur -->
	{#if !mobile}
		<button
			type="button"
			onclick={() => (collapsedState = !collapsedState)}
			aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
			class="absolute top-8 -right-5 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-linear-to-br from-accent to-primary text-accent-foreground shadow-md transition hover:bg-primary hover:text-primary-foreground"
		>
			{#if collapsed}
				<ChevronRight class="h-5 w-5" />
			{:else}
				<ChevronLeft class="h-5 w-5" />
			{/if}
		</button>
	{/if}

	<!-- HEADER / Avatar -->
	<a
		href={resolve(profileHref)}
		onclick={() => onClose?.()}
		title={collapsed ? 'Mon profil' : undefined}
		class="group flex items-center gap-3 border-b border-border px-4 py-5 transition-colors
		{collapsed ? 'justify-center' : ''}
		{isActive(profileHref) ? 'bg-accent' : 'hover:bg-accent/50'}"
	>
		<div
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary text-sm font-bold text-primary-foreground shadow-md transition-transform group-hover:scale-105"
		>
			{initials}
		</div>
		{#if !collapsed}
			<div class="overflow-hidden">
				<p class="truncate text-sm font-semibold text-foreground">
					{user.profil.firstName}
					{user.profil.lastName}
				</p>
				<p class="truncate text-xs text-muted-foreground">{roleLabel}</p>
			</div>
		{/if}
	</a>

	<!-- NAV -->
	<nav class="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-4">
		{#each items as item (item.href)}
			{@const Icon = item.icon}
			{@const active = isActive(item.href)}
			{@const badge = badges[item.href] ?? 0}
			<a
				href={resolve(item.href)}
				onclick={() => onClose?.()}
				aria-current={active ? 'page' : undefined}
				class="group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
				{collapsed ? 'justify-center' : 'gap-3'}
				{active
					? 'bg-accent text-accent-foreground'
					: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}"
			>
				{#if active}
					<span class="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
					></span>
				{/if}

				<Icon
					class="h-6 w-6 shrink-0 transition-colors {active
						? 'text-primary'
						: 'text-muted-foreground group-hover:text-foreground'}"
				/>

				{#if collapsed}
					<!-- Infobulle quand le menu est replié -->
					<span
						class="pointer-events-none absolute left-full ml-3 rounded-lg border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
					>
						{item.label}{badge > 0 ? ` · ${badge} à traiter` : ''}
					</span>
					<!-- Menu replié : une pastille sur l'icône -->
					{#if badge > 0}
						<span
							class="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white"
							aria-hidden="true"
						>
							{badge > 9 ? '9+' : badge}
						</span>
					{/if}
				{:else}
					<span>{item.label}</span>
					{#if badge > 0}
						<span
							class="ml-auto rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-white"
							title="{badge} à traiter"
						>
							{badge}
						</span>
					{/if}
				{/if}
				{#if badge > 0}
					<span class="sr-only">({badge} à traiter)</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- BOTTOM -->
	<div class="flex flex-col gap-1 border-t border-border px-2 py-3">
		<form method="POST" action="/logout" use:enhance>
			<button
				type="submit"
				class="group relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive
				{collapsed ? 'justify-center' : 'gap-3'}"
			>
				<LogOut class="h-4.5 w-4.5 shrink-0" />
				{#if collapsed}
					<span
						class="pointer-events-none absolute left-full ml-3 rounded-lg border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
					>
						Déconnexion
					</span>
				{:else}
					<span>Déconnexion</span>
				{/if}
			</button>
		</form>
	</div>
</aside>
