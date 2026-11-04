<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { VolunteerRole } from '@prisma/client';
	import type { AppUser } from '$lib/types/user';
	import { VOLUNTEER_ROLE_OPTIONS } from '$lib/constants/volunteer';
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
		FileQuestionMark
	} from '@lucide/svelte';

	type Props = {
		user: AppUser;
		/** Affichage dans le tiroir mobile : pleine largeur, jamais repliée */
		mobile?: boolean;
		/** Appelé au clic sur un lien (ex : fermer le tiroir mobile) */
		onClose?: () => void;
	};

	let { user, mobile = false, onClose }: Props = $props();

	// Sur mobile, la sidebar n'est jamais repliée
	let collapsedState = $state(false);
	const collapsed = $derived(!mobile && collapsedState);

	type NavItem = {
		label: string;
		icon: typeof LayoutDashboard;
		href: Pathname;
		roles: VolunteerRole[];
	};

	const allItems: NavItem[] = [
		{
			label: 'Dashboard',
			icon: LayoutDashboard,
			href: '/dashboard',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: 'Chats',
			icon: Cat,
			href: '/dashboard/chat',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: "Familles d'accueil",
			icon: HouseHeart,
			href: '/dashboard/famille_d_accueil',
			roles: ['ADMIN']
		},
		{ label: 'Bénévoles', icon: Users, href: '/dashboard/benevole', roles: ['ADMIN'] },
		{ label: 'News', icon: Newspaper, href: '/dashboard/news', roles: ['ADMIN', 'COMMUNICATION'] },
		{
			label: 'Formulaires',
			icon: ClipboardList,
			href: '/dashboard/forms',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		},
		{
			label: 'Information',
			icon: FileQuestionMark,
			href: '/dashboard/information',
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION']
		}
	];

	const profileHref: Pathname = '/dashboard/profil';

	const items = $derived(allItems.filter((item) => item.roles.includes(user.role)));
	const initials = $derived(`${user.profil.firstName[0]}${user.profil.lastName[0]}`.toUpperCase());
	const roleLabel = $derived(
		VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === user.role)?.label ?? user.role
	);

	// Actif aussi sur les sous-pages (/dashboard/chat/123), sauf pour /dashboard lui-même
	function isActive(href: string): boolean {
		const path = page.url.pathname;
		return href === '/dashboard' ? path === href : path === href || path.startsWith(`${href}/`);
	}
</script>

<aside
	class="bg-accent/70 border-accent/40 relative flex flex-col backdrop-blur-lg transition-all duration-300 ease-in-out
	{mobile ? 'h-full w-full' : `h-dvh border-r ${collapsed ? 'w-18' : 'w-45'}`}"
>
	<!-- Bouton replier / déplier : uniquement sur ordinateur -->
	{#if !mobile}
		<button
			type="button"
			onclick={() => (collapsedState = !collapsedState)}
			aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
			class="from-accent to-primary border-border text-accent-foreground hover:bg-primary hover:text-primary-foreground absolute top-8 -right-5 z-50 flex h-8 w-8 items-center justify-center rounded-full border bg-linear-to-br shadow-md transition"
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
		class="group border-border flex items-center gap-3 border-b px-4 py-5 transition-colors
		{collapsed ? 'justify-center' : ''}
		{isActive(profileHref) ? 'bg-accent' : 'hover:bg-accent/50'}"
	>
		<div
			class="from-primary to-secondary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-sm font-bold shadow-md transition-transform group-hover:scale-105"
		>
			{initials}
		</div>
		{#if !collapsed}
			<div class="overflow-hidden">
				<p class="text-foreground truncate text-sm font-semibold">
					{user.profil.firstName}
					{user.profil.lastName}
				</p>
				<p class="text-muted-foreground truncate text-xs">{roleLabel}</p>
			</div>
		{/if}
	</a>

	<!-- NAV -->
	<nav class="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-4">
		{#each items as item (item.href)}
			{@const Icon = item.icon}
			{@const active = isActive(item.href)}
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
					<span class="bg-primary absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full"
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
						class="bg-popover border-border text-popover-foreground pointer-events-none absolute left-full ml-3 rounded-lg border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
					>
						{item.label}
					</span>
				{:else}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- BOTTOM -->
	<div class="border-border flex flex-col gap-1 border-t px-2 py-3">
		<form method="POST" action="/logout" use:enhance>
			<button
				type="submit"
				class="group text-muted-foreground hover:bg-destructive/10 hover:text-destructive relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition
				{collapsed ? 'justify-center' : 'gap-3'}"
			>
				<LogOut class="h-4.5 w-4.5 shrink-0" />
				{#if collapsed}
					<span
						class="bg-popover border-border text-popover-foreground pointer-events-none absolute left-full ml-3 rounded-lg border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
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
