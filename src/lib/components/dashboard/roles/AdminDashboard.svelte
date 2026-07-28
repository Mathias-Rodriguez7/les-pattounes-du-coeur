<script lang="ts">
	import { fade } from 'svelte/transition';
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import QuickActions from '$lib/components/dashboard/shared/QuickActions.svelte';
	import TasksToProcess from '$lib/components/dashboard/shared/TasksToProcess.svelte';
	import StatsOverview from '$lib/components/dashboard/shared/StatsOverview.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isManagerView = $state(false);

	const adminQuickActions = data.adminQuickActions;
	const managerQuickActions = data.managerQuickActions;
	const adminTasks = data.adminTasks;
	const managerTasks = data.managerTasks;

	const displayedActions = $derived(isManagerView ? managerQuickActions : adminQuickActions);
	const displayedTasks = $derived(isManagerView ? managerTasks : adminTasks);
</script>

<!-- SWITCH VIEW -->
<div class="mb-8 flex items-center space-x-4">
	<Switch id="view-toggle" bind:checked={isManagerView} />
	<Label for="view-toggle" class="text-xl font-bold">
		{isManagerView ? 'Vue Manager' : 'Vue Admin'}
	</Label>
</div>

<div class="flex flex-col gap-8 lg:min-h-[calc(100vh-550px)] lg:flex-row">
	<!-- COLONNE GAUCHE -->
	<div class="flex flex-col gap-8 lg:flex-1">
		{#key isManagerView}
			<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
				<QuickActions actions={displayedActions} />
			</div>

			<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
				<TasksToProcess taskGroups={displayedTasks} />
			</div>
		{/key}
	</div>

	<!-- COLONNE DROITE - STATS -->
	<aside class="flex flex-col gap-4 lg:min-h-full lg:w-80">
		<SectionHeader title="Vue d'ensemble" />
		<StatsOverview {data} />
	</aside>
</div>
