<script lang="ts">
	import SectionHeader from '#lib/components/dashboard/SectionHeader.svelte';
	import TaskBoard from '#lib/components/dashboard/shared/TaskBoard.svelte';
	import StatsOverview from '#lib/components/dashboard/shared/StatsOverview.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import type { TaskFocus } from '#lib/tasks/tasks.ts';
	// Les types du load du dashboard : le composant est dans $lib, le load dans routes/
	import type { PageData } from '../../../../routes/(app)/dashboard/$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// La vue de l'admin : ses tâches, toutes, ou celles d'une bénévole (pour l'aider, répartir…)
	let view = $state('MINE');
	const viewOptions = $derived([
		{ value: 'MINE', label: 'Mes tâches' },
		{ value: 'ALL', label: 'Toutes les tâches' },
		...data.taskVolunteers.map((v) => ({ value: v.id, label: `Tâches de ${v.name}` }))
	]);
	const focus = $derived<TaskFocus>(
		view === 'MINE'
			? { kind: 'MINE' }
			: view === 'ALL'
				? { kind: 'ALL' }
				: { kind: 'VOLUNTEER', id: view }
	);
</script>

<section class="flex flex-col gap-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
			Bonjour {data.user?.profil.firstName} 👋
		</h1>
		<SelectField
			id="tasks-view"
			label=""
			options={viewOptions}
			bind:value={view}
			class="w-full sm:w-72"
			wrapperClass="w-full sm:w-auto"
		/>
	</header>

	<div class="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_320px]">
		<!-- COLONNE GAUCHE : ce qu'il y a à faire -->
		{#if data.user}
			<TaskBoard tasks={data.myTasks} viewer={data.user} {focus} volunteers={data.taskVolunteers} />
		{/if}

		<!-- COLONNE DROITE - STATS -->
		<aside class="sticky top-8 flex flex-col gap-4 self-start">
			<SectionHeader title="Vue d'ensemble" />
			<StatsOverview {data} />
		</aside>
	</div>
</section>
