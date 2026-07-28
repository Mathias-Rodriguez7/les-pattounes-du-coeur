<script lang="ts">
	import AdminDashboard from '$lib/components/dashboard/roles/AdminDashboard.svelte';
	import ManagerDashboard from '$lib/components/dashboard/roles/ManagerDashboard.svelte';
	import CommunicationDashboard from '$lib/components/dashboard/roles/CommunicationDashboard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const userRole = $derived(data.user?.role ?? 'MANAGER');
</script>

<main class="mx-auto flex w-full flex-col gap-8 px-8 py-6">
	<header class="flex items-center justify-between">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-bold tracking-tight">
				Bonjour {data.user?.firstName} 👋
			</h1>
			<p class="text-muted-foreground text-sm">Rôle: {userRole}</p>
		</div>
	</header>

	{#if userRole === 'ADMIN'}
		<AdminDashboard {data} />
	{:else if userRole === 'COMMUNICATION'}
		<CommunicationDashboard {data} />
	{:else}
		<ManagerDashboard {data} />
	{/if}
</main>
