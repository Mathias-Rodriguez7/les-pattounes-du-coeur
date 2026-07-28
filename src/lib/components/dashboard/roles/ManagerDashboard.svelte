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

<div class="flex flex-col gap-8 lg:min-h-[calc(100vh-550px)] lg:flex-row">
	<!-- COLONNE GAUCHE -->
	<div class="flex flex-col gap-8 lg:flex-1">
		<!-- ACTIONS RAPIDES MANAGER -->
		<QuickActions actions={managerQuickActions} />

		<!-- TÂCHES À TRAITER -->
		<TasksToProcess taskGroups={managerTasks} />
	</div>

	<!-- COLONNE DROITE - STATS MANAGER -->
	<aside class="flex flex-col gap-4 lg:min-h-full lg:w-96">
		<SectionHeader title="Mes Stats" />
		<StatsOverview {data} />
	</aside>
</div>

<!-- GRAPHIQUES COMMUNS -->
