<script lang="ts">
	import { enhance } from '$app/forms';

	import {
		LayoutDashboard,
		Cat,
		HouseHeart,
		Users,
		LogOut,
		ArrowLeftFromLine,
		ArrowRightToLine,
		UserCog
	} from 'lucide-svelte';
	import { resolve } from '$app/paths';

	let collapsed = $state(false);

	const items = [
		{ label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
		{ label: 'Chats', icon: Cat, href: '/dashboard/cats' },
		{ label: 'Familles', icon: HouseHeart, href: '/dashboard/hosts' },
		{ label: 'Bénévoles', icon: Users, href: '/dashboard/volunteers' }
	] as const;
</script>

<aside
	class={`bg-accent text-foreground relative flex h-screen flex-col transition-all ${collapsed ? 'w-16' : 'w-64'}`}
>
	<!-- toggle -->
	<button
		onclick={() => (collapsed = !collapsed)}
		class="bg-background hover:bg-secondary absolute top-6 -right-4 z-50 rounded-full p-2 shadow-xl transition"
	>
		{#if collapsed}
			<ArrowRightToLine class="h-5 w-5" />
		{:else}
			<ArrowLeftFromLine class="h-5 w-5" />
		{/if}
	</button>

	<!-- NAV -->
	<nav class="flex flex-col gap-2 p-4 pt-16">
		{#each items as item (item.href)}
			{@const Icon = item.icon}

			<a
				href={resolve(item.href)}
				class={`hover:bg-primary-foreground flex items-center rounded-2xl p-3 transition-all duration-200 ${
					collapsed ? 'justify-center' : 'gap-3'
				}`}
			>
				<div class="flex justify-center">
					<Icon class="h-5 w-5" />
				</div>

				{#if !collapsed}
					<span class="text-2xl">{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- PUSH BOTTOM SECTION -->
	<div class="mt-auto flex flex-col gap-3 p-2">
		<!-- PROFILE -->
		<a
			href={resolve('/profile')}
			class="hover:bg-primary-foreground flex items-center gap-3 rounded-4xl p-4"
		>
			<UserCog class="h-5 w-5" />

			{#if !collapsed}
				<span class="text-2xl">Mon profil</span>
			{/if}
		</a>

		<!-- LOGOUT -->
		<form method="POST" action="/logout" use:enhance>
			<button
				type="submit"
				class="flex w-full items-center gap-3 rounded-4xl p-4 text-red-400 hover:bg-red-700"
			>
				<LogOut class="h-5 w-5" />

				{#if !collapsed}
					<span class="text-2xl">Déconnexion</span>
				{/if}
			</button>
		</form>
	</div>
</aside>
