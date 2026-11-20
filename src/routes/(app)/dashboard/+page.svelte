<script lang="ts">
	import AdminDashboard from '#lib/components/dashboard/roles/AdminDashboard.svelte';
	import ManagerDashboard from '#lib/components/dashboard/roles/ManagerDashboard.svelte';
	import CommunicationDashboard from '#lib/components/dashboard/roles/CommunicationDashboard.svelte';
	import MyStats from '#lib/components/dashboard/shared/MyStats.svelte';
	import type { PageData } from './$types';
	import type { TaskBoardKind } from '#lib/constants/tasks.ts';
	import { fade, fly } from 'svelte/transition';

	let { data }: { data: PageData } = $props();

	const userRole = $derived(data.user?.role ?? 'MANAGER');

	// L'admin bascule entre sa vue admin et sa vue bénévole : ses tâches ET ses stats suivent
	let adminView = $state<TaskBoardKind>('ADMIN');
	const statsView = $derived(
		userRole === 'ADMIN'
			? adminView === 'ADMIN'
				? 'ADMIN'
				: 'VOLUNTEER'
			: userRole === 'COMMUNICATION'
				? 'COMMUNICATION'
				: 'VOLUNTEER'
	);
</script>

<svelte:head>
	<title>Dashboard – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<!-- Le titre de la page, pour les lecteurs d'écran et les moteurs de recherche -->
	<h1 class="sr-only">Dashboard</h1>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-6 p-10">
		<div>
			{#if userRole === 'ADMIN'}
				<AdminDashboard {data} bind:view={adminView} />
			{:else if userRole === 'COMMUNICATION'}
				<CommunicationDashboard {data} />
			{:else}
				<ManagerDashboard {data} />
			{/if}
		</div>

		<section class="flex flex-col gap-4">
			<h2 class="text-xl font-bold">Mes stats</h2>
			<MyStats stats={data.myStats} view={statsView} />
		</section>
	</div>
</main>
