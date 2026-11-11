<script lang="ts">
	import { fade } from 'svelte/transition';
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import QuickActions from '$lib/components/dashboard/shared/QuickActions.svelte';
	import TasksToProcess from '$lib/components/dashboard/shared/TasksToProcess.svelte';
	import StatsOverview from '$lib/components/dashboard/shared/StatsOverview.svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	// Les types du load du dashboard : le composant est dans $lib, le load dans routes/
	import type { PageData } from '../../../../routes/(app)/dashboard/$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isManagerView = $state(false);

	// $derived : les valeurs suivent `data` (rechargé après chaque action), au lieu d'en garder une copie
	const adminQuickActions = $derived(data.adminQuickActions);
	const managerQuickActions = $derived(data.managerQuickActions);
	const adminTasks = $derived(data.adminTasks ?? []);
	const managerTasks = $derived(data.managerTasks ?? []);

	const displayedActions = $derived(isManagerView ? managerQuickActions : adminQuickActions);
	const displayedTasks = $derived(isManagerView ? managerTasks : adminTasks);
</script>

<section class="flex flex-col gap-6">
	<header class="flex items-center justify-between">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
				Bonjour {data.user?.profil.firstName} 👋
			</h1>
		</div>
		<!-- SWITCH VIEW -->
		<div class="flex items-center justify-center gap-4">
			<Switch id="view-toggle" bind:checked={isManagerView} />
			<Label for="view-toggle" class="text-lg font-bold sm:text-xl">
				{isManagerView ? 'Vue Manager' : 'Vue Admin'}
			</Label>
		</div>
	</header>

	<div>
		<div class="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_320px] lg:grid-rows-[1fr]">
			<!-- COLONNE GAUCHE -->
			<div class="flex flex-col gap-6 sm:gap-8">
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
			<aside class="sticky top-8 flex flex-col gap-4">
				<SectionHeader title="Vue d'ensemble" />
				<StatsOverview {data} />
			</aside>
		</div>
	</div>
</section>
