<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { VolunteerRole } from '../../../generated/prisma/enums';
	import {
		LayoutDashboard,
		Cat,
		HouseHeart,
		Users,
		LogOut,
		UserCog,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { Route } from '@sveltejs/kit';

	const { user, onClose } = $props<{
		user: {
			id: string;
			role: VolunteerRole;
			profil: {
				firstName: string;
				lastName: string;
				email: string;
			};
		};
		onClose?: () => void;
	}>();

	let collapsed = $state(false);

	const allItems = [
		{
			label: 'Dashboard',
			icon: LayoutDashboard,
			href: '/dashboard' as const,
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION'] as VolunteerRole[]
		},
		{
			label: 'Chats',
			icon: Cat,
			href: '/dashboard/chat' as const,
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION'] as VolunteerRole[]
		},
		{
			label: 'FA',
			icon: HouseHeart,
			href: '/dashboard/fa' as const,
			roles: ['ADMIN', 'MANAGER', 'COMMUNICATION'] as VolunteerRole[]
		},
		{
			label: 'Bénévoles',
			icon: Users,
			href: '/dashboard/benevole' as const,
			roles: ['ADMIN'] as VolunteerRole[]
		}
	];

	const items = $derived(allItems.filter((item) => item.roles.includes(user.role)));

	const initials = $derived(`${user.profil.firstName[0]}${user.profil.lastName[0]}`.toUpperCase());
</script>

<aside
	class={`bg-accent/70 border-accent/40 relative flex h-screen flex-col border-r backdrop-blur-lg transition-all duration-300 ease-in-out
    ${collapsed ? 'w-18' : 'w-60'}`}
>
	<!-- Toggle -->
	<button
		onclick={() => (collapsed = !collapsed)}
		class="from-accent to-primary border-border text-accent-foreground hover:bg-primary hover:text-primary-foreground absolute top-8 -right-5 z-50 hidden h-8 w-8 items-center justify-center rounded-full border bg-linear-to-br shadow-md transition lg:flex"
	>
		{#if collapsed}
			<ChevronRight class="h-5 w-5" />
		{:else}
			<ChevronLeft class="h-5 w-5" />
		{/if}
	</button>

	<!-- HEADER / Avatar -->
	<div
		class={`border-border flex items-center gap-3 border-b px-4 py-5 ${collapsed ? 'justify-center' : ''}`}
	>
		<div
			class="from-primary to-secondary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-sm font-bold shadow-md"
		>
			{initials}
		</div>
		{#if !collapsed}
			<div class="overflow-hidden">
				<p class="text-foreground truncate text-sm font-semibold">
					{user.profil.firstName}
					{user.profil.lastName}
				</p>
				<p class="text-muted-foreground truncate text-xs">{user.role}</p>
			</div>
		{/if}
	</div>

	<!-- NAV -->
	<nav class="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-4">
		{#each items as item (item.href)}
			{@const Icon = item.icon}
			{@const isActive = $page.url.pathname === item.href}
			<a
				href={resolve(item.href as Route)}
				onclick={() => onClose?.()}
				class={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                ${collapsed ? 'justify-center' : 'gap-3'}
                ${
									isActive
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
								}`}
			>
				{#if isActive}
					<span class="bg-primary absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full"
					></span>
				{/if}

				<Icon
					class={`h-6 w-6 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
				/>

				{#if !collapsed}
					<span>{item.label}</span>
				{/if}

				<!-- Tooltip si collapsed -->
				{#if collapsed}
					<span
						class="bg-popover border-border text-popover-foreground pointer-events-none absolute left-full ml-3 rounded-lg border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
					>
						{item.label}
					</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- BOTTOM -->
	<div class="border-border flex flex-col gap-1 border-t px-2 py-3">
		<a
			href={resolve('/profile')}
			onclick={() => onClose?.()}
			class={`group text-muted-foreground hover:bg-accent/50 hover:text-foreground relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition
            ${collapsed ? 'justify-center' : 'gap-3'}`}
		>
			<UserCog class="h-4.5 w-4.5 shrink-0" />
			{#if !collapsed}
				<span>Mon profil</span>
			{/if}
			{#if collapsed}
				<span
					class="bg-popover border-border text-popover-foreground pointer-events-none absolute left-full ml-3 rounded-lg border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
				>
					Mon profil
				</span>
			{/if}
		</a>

		<form method="POST" action="/logout" use:enhance>
			<button
				type="submit"
				class={`group text-muted-foreground hover:bg-destructive/10 hover:text-destructive relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition
                ${collapsed ? 'justify-center' : 'gap-3'}`}
			>
				<LogOut class="h-4.5 w-4.5 shrink-0" />
				{#if !collapsed}
					<span>Déconnexion</span>
				{/if}
				{#if collapsed}
					<span
						class="bg-popover border-border text-popover-foreground pointer-events-none absolute left-full ml-3 rounded-lg border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
					>
						Déconnexion
					</span>
				{/if}
			</button>
		</form>
	</div>
</aside>
