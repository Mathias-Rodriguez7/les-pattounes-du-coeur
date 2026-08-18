<script lang="ts">
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import QuickActions from '$lib/components/dashboard/shared/QuickActions.svelte';
	import TasksToProcess from '$lib/components/dashboard/shared/TasksToProcess.svelte';
	import StatsOverview from '$lib/components/dashboard/shared/StatsOverview.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const managerQuickActions = $derived(data.managerQuickActions);
	const managerTasks = $derived(data.managerTasks ?? []);
</script>

<section>
	<header class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
			Bonjour {data.user?.firstName} 👋
		</h1>
	</header>
	<div class="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_320px] lg:grid-rows-[1fr]">
		<!-- COLONNE GAUCHE -->
		<div class="flex flex-col gap-6 sm:gap-8">
			<!-- ACTIONS RAPIDES MANAGER -->
			<QuickActions actions={managerQuickActions} />

			<!-- TÂCHES À TRAITER -->
			<TasksToProcess taskGroups={managerTasks} />
		</div>

		<!-- COLONNE DROITE - STATS MANAGER -->
		<aside class="sticky top-8 flex flex-col gap-4">
			<SectionHeader title="Mes Stats" />
			<StatsOverview {data} />
		</aside>
	</div>
</section>
