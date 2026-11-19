<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight, HeartHandshake, ShieldCheck } from '@lucide/svelte';
	import SectionHeader from '#lib/components/dashboard/SectionHeader.svelte';
	import TaskBoard from '#lib/components/dashboard/shared/TaskBoard.svelte';
	import SegmentedTabs from '#lib/components/tabs/SegmentedTabs.svelte';
	import QuickCreate from '#lib/components/dashboard/shared/QuickCreate.svelte';
	import StatsOverview from '#lib/components/dashboard/shared/StatsOverview.svelte';
	import { TASK_URGENCY, type TaskBoardKind } from '#lib/constants/tasks.ts';
	import { countByUrgency, tasksByVolunteer } from '#lib/tasks/board.ts';
	import { adminTasks, volunteerTasks } from '#lib/tasks/tasks.ts';
	import { applySnoozes } from '#lib/tasks/snooze.ts';
	// Les types du load du dashboard : le composant est dans $lib, le load dans routes/
	import type { PageData } from '../../../../routes/(app)/dashboard/$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Deux vues : les actions d'administration, et ses propres tâches de bénévole
	let view = $state<TaskBoardKind>('ADMIN');

	// « Plus tard » : ce qu'elle a mis de côté sort de la liste et des compteurs
	const now = new Date();
	const admin = $derived(
		applySnoozes(adminTasks(data.myTasks, data.user?.id), data.mySnoozes, now)
	);
	const mine = $derived(
		applySnoozes(data.user ? volunteerTasks(data.myTasks, data.user) : [], data.mySnoozes, now)
	);
	const forAdmin = $derived(admin.active);
	const forMe = $derived(mine.active);

	const tabs = $derived([
		{ kind: 'ADMIN' as const, label: 'Admin', icon: ShieldCheck, tasks: forAdmin },
		{ kind: 'VOLUNTEER' as const, label: 'Bénévole', icon: HeartHandshake, tasks: forMe }
	]);

	/** La pastille d'un onglet : le nombre de tâches, en rouge s'il y en a d'urgentes */
	function tabBadge(tasks: typeof forAdmin) {
		const counts = countByUrgency(tasks);
		return counts.URGENT > 0 ? TASK_URGENCY.URGENT.color : TASK_URGENCY.WEEK.color;
	}

	// Les bénévoles qui ont des tâches urgentes : un lien vers leur suivi (page Bénévoles)
	const lateVolunteers = $derived(
		Object.values(tasksByVolunteer(data.myTasks)).filter((list) =>
			list.some((task) => task.urgency === 'URGENT')
		).length
	);
</script>

<section class="flex flex-col gap-6">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
			Bonjour {data.user?.profil.firstName} 👋
		</h1>

		<!-- Les deux vues, avec le nombre de tâches de chacune -->
		<SegmentedTabs
			label="Vue des tâches"
			bind:value={view}
			tabs={tabs.map((tab) => ({
				key: tab.kind,
				label: tab.label,
				icon: tab.icon,
				count: tab.tasks.length,
				countClass: tabBadge(tab.tasks)
			}))}
		/>
	</header>

	<div class="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_320px]">
		<!-- Les actions rapides (au niveau de « Vue d'ensemble »), puis ce qu'il y a à faire -->
		<div class="flex min-w-0 flex-col gap-6">
			{#if data.user}
				<QuickCreate role={data.user.role} />
			{/if}
			{#key view}
				{#if view === 'ADMIN'}
					<TaskBoard
						tasks={forAdmin}
						snoozed={admin.snoozed}
						canSnooze
						kind="ADMIN"
						isAdmin
						title="Mes tâches d’admin"
					>
						{#snippet headerExtra()}
							{#if lateVolunteers > 0}
								<a
									href={resolve('dashboard/benevole?taches=URGENT')}
									class="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-0.5 text-sm transition-colors hover:bg-muted"
								>
									<span class="font-semibold text-red-700">{lateVolunteers}</span>
									bénévole{lateVolunteers > 1 ? 's' : ''} avec des tâches urgentes
									<span class="font-medium text-primary">Voir le suivi</span>
									<ArrowRight class="size-3.5 text-primary" />
								</a>
							{/if}
						{/snippet}
					</TaskBoard>
				{:else}
					<TaskBoard
						tasks={forMe}
						snoozed={mine.snoozed}
						canSnooze
						kind="VOLUNTEER"
						role={data.user?.role}
						isAdmin
						title="Mes tâches de bénévole"
					/>
				{/if}
			{/key}
		</div>

		<!-- COLONNE DROITE - STATS -->
		<aside class="sticky top-8 flex flex-col gap-4 self-start">
			<SectionHeader title="Vue d'ensemble" />
			<StatsOverview {data} />
		</aside>
	</div>
</section>
