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

	const communicationQuickActions = $derived(data.communicationQuickActions);
	const communicationTasks = $derived(data.communicationTasks ?? []);
</script>

<div class="flex flex-col gap-8 lg:min-h-[calc(100vh-550px)] lg:flex-row">
	<!-- COLONNE GAUCHE -->
	<div class="flex flex-col gap-8 lg:flex-1">
		<!-- ACTIONS RAPIDES COMMUNICATION -->
		<QuickActions actions={communicationQuickActions} />

		<!-- TÂCHES À TRAITER -->
		<TasksToProcess taskGroups={communicationTasks} />
	</div>

	<!-- COLONNE DROITE - STATS COMMUNICATION -->
	<aside class="flex flex-col gap-4 lg:min-h-full lg:w-96">
		<SectionHeader title="Mes Stats" />
		<StatsOverview {data} />
	</aside>
</div>

<!-- GRAPHIQUES COMMUNS -->
