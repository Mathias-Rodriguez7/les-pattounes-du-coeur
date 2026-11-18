<script lang="ts">
	import SectionHeader from '#lib/components/dashboard/SectionHeader.svelte';
	import TaskBoard from '#lib/components/dashboard/shared/TaskBoard.svelte';
	import { applySnoozes } from '#lib/tasks/snooze.ts';
	import QuickCreate from '#lib/components/dashboard/shared/QuickCreate.svelte';
	import StatsOverview from '#lib/components/dashboard/shared/StatsOverview.svelte';
	// Les types du load du dashboard : le composant est dans $lib, le load dans routes/
	import type { PageData } from '../../../../routes/(app)/dashboard/$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// « Plus tard » : ce qu'elle a mis de côté sort de la liste et des compteurs
	const board = $derived(applySnoozes(data.myTasks, data.mySnoozes, new Date()));
</script>

<section class="flex flex-col gap-6">
	<header class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
			Bonjour {data.user?.profil.firstName} 👋
		</h1>
	</header>

	<div class="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_320px]">
		<!-- Les actions rapides (au niveau de « Vue d'ensemble »), puis ce qu'il y a à faire -->
		<div class="flex min-w-0 flex-col gap-6">
			{#if data.user}
				<QuickCreate role={data.user.role} />
			{/if}
			{#if data.user}
				<TaskBoard
					tasks={board.active}
					snoozed={board.snoozed}
					canSnooze
					kind="VOLUNTEER"
					role={data.user.role}
				/>
			{/if}
		</div>

		<!-- COLONNE DROITE - STATS -->
		<aside class="sticky top-8 flex flex-col gap-4 self-start">
			<SectionHeader title="Vue d'ensemble" />
			<StatsOverview {data} />
		</aside>
	</div>
</section>
