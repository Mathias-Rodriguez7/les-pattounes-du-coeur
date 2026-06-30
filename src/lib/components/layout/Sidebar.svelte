<script lang="ts">
	import { enhance } from '$app/forms';
	import type { VolunteerRole } from '../../../generated/prisma/enums';
	import {
		LayoutDashboard,
		Cat,
		HouseHeart,
		Users,
		LogOut,
		ArrowLeftFromLine,
		ArrowRightToLine,
		UserCog
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
			roles: ['ADMIN', 'VOLUNTEER'] as VolunteerRole[]
		},
		{
			label: 'Chats',
			icon: Cat,
			href: '/dashboard/chat' as const,
			roles: ['ADMIN', 'VOLUNTEER'] as VolunteerRole[]
		},
		{
			label: 'FA',
			icon: HouseHeart,
			href: '/dashboard/fa' as const,
			roles: ['ADMIN', 'VOLUNTEER'] as VolunteerRole[]
		},
		{
			label: 'Bénévoles',
			icon: Users,
			href: '/dashboard/benevole' as const,
			roles: ['ADMIN'] as VolunteerRole[]
		}
	];

	const items = $derived(allItems.filter((item) => item.roles.includes(user.role)));
</script>

<aside
	class={`bg-accent/70 border-accent/40 text-foreground relative flex h-screen flex-col border-b shadow-sm backdrop-blur-lg transition-all duration-300
    ${collapsed ? 'w-16' : 'w-64'}`}
>
	<!-- Toggle collapse — caché sur mobile -->
	<button
		onclick={() => (collapsed = !collapsed)}
		class="from-accent to-primary absolute top-6 -right-4 z-50 hidden rounded-2xl bg-linear-to-br p-2 shadow-xl transition lg:flex"
	>
		{#if collapsed}
			<ArrowRightToLine class="h-5 w-5" />
		{:else}
			<ArrowLeftFromLine class="h-5 w-5" />
		{/if}
	</button>

	<!-- USER INFO -->
	{#if !collapsed}
		<div class="px-4 pt-6 pb-2">
			<p class="text-sm font-semibold">
				{user.profil.firstName}
				{user.profil.lastName}
			</p>
			<p class="text-muted-foreground text-xs">{user.role}</p>
		</div>
	{/if}

	<!-- NAV -->
	<nav class="flex flex-col gap-2 pt-4">
		{#each items as item (item.href)}
			{@const Icon = item.icon}
			<a
				href={resolve(item.href as Route)}
				onclick={() => onClose?.()}
				class={`hover:bg-primary-foreground flex items-center rounded-2xl p-3 transition-all duration-200
                ${collapsed ? 'justify-center' : 'gap-3'}`}
			>
				<div
					class="from-accent to-primary flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br shadow-lg"
				>
					<Icon class="h-5 w-5" />
				</div>
				{#if !collapsed}
					<span class="text-2xl">{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- BOTTOM -->
	<div class="mt-auto flex flex-col gap-3 p-2">
		<a
			href={resolve('/profile')}
			onclick={() => onClose?.()}
			class="hover:bg-primary-foreground flex items-center gap-3 rounded-4xl p-4"
		>
			<UserCog class="h-5 w-5" />
			{#if !collapsed}
				<span class="text-2xl">Mon profil</span>
			{/if}
		</a>

		<form method="POST" action="/logout" use:enhance>
			<button
				type="submit"
				class="hover:bg-destructive flex w-full items-center gap-3 rounded-4xl p-4 text-red-400"
			>
				<LogOut class="h-5 w-5" />
				{#if !collapsed}
					<span class="text-2xl">Déconnexion</span>
				{/if}
			</button>
		</form>
	</div>
</aside>
