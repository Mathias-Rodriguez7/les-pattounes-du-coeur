<script lang="ts">
	import AdoptedBadge from '$lib/components/AdoptedBadge.svelte';
	import CatCard from '$lib/components/cats/CatCard.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';

	import { Cat, Users, HouseHeart, Mail, PawPrint } from '@lucide/svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const stats = $derived(data.stats);

	const latestAdoptedCats = $derived(data.latestAdoptedCats ?? []);

	const fullName = $derived(data.user ? `${data.user.firstName} ${data.user.lastName}` : 'invité');

	const tasks = $derived(data.dashboardTasks ?? []);

	/*
	|--------------------------------------------------------------------------
	| QUICK ACTION ICONS
	|--------------------------------------------------------------------------
	*/

	const quickActionIcons = {
		cat: Cat,
		users: Users,
		house: HouseHeart,
		mail: Mail
	};
</script>

<main class="flex flex-col gap-10 p-16">
	<!-- 📊 HEADER + STATS -->
	<section
		class="
			bg-secondary-foreground
			grid
			grid-cols-1
			gap-6
			rounded-2xl
			p-4
			shadow-sm
			md:grid-cols-3
		"
	>
		<!-- WELCOME -->
		<div class="bg-card rounded-3xl p-6">
			<h1 class="text-2xl font-bold">
				Bienvenue {fullName} 👋
			</h1>

			<p class="text-muted-foreground mt-2">Heureux de vous revoir</p>
		</div>

		<!-- TASKS -->
		<TaskCard title="Mes tâches" {tasks} />

		<!-- PERSONAL STATS -->
		<StatCard
			title="Vos stats"
			stats={[
				{
					label: 'Chats suivis',
					value: stats.volunteerCats,
					total: stats.totalAvailableCats,
					icon: Cat
				},

				{
					label: 'Familles associées',
					value: stats.volunteerHosts,
					total: stats.totalActiveHosts,
					icon: HouseHeart
				},

				{
					label: 'Adoptions réalisées',
					value: stats.volunteerAdoptions,
					total: stats.totalYearAdoptions,
					icon: PawPrint
				}
			]}
		/>
	</section>

	<!-- ⚡ QUICK ACTIONS -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold">Actions rapides</h2>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			{#each data.quickActions as action (action.label)}
				<a
					href={action.href}
					class="
						group
						bg-popover
						hover:border-primary/40
						flex
						min-h-45
						flex-col
						justify-between
						rounded-3xl
						p-6
						shadow-sm
						transition-all
						duration-300
						hover:-translate-y-1
						hover:shadow-xl
					"
				>
					<!-- ICON -->
					<div
						class="
							from-accent
							to-primary
							flex
							h-14
							w-14
							items-center
							justify-center
							rounded-2xl
							bg-linear-to-br
							shadow-lg
						"
					>
						<svelte:component this={quickActionIcons[action.icon]} size={28} />
					</div>

					<!-- CONTENT -->
					<div>
						<h3 class="mt-4 text-lg font-semibold">
							{action.label}
						</h3>

						<p class="text-muted-foreground mt-2 text-sm">
							{action.description}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- 🐱 RECENT ADOPTIONS -->
	<section>
		<h2 class="text-foreground mb-4 text-lg font-semibold">Derniers chats adoptés</h2>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
			{#each latestAdoptedCats as cat (cat.id)}
				<div class="relative overflow-hidden rounded-3xl shadow-xl">
					<AdoptedBadge />

					<CatCard {cat} />
				</div>
			{:else}
				<p class="text-muted-foreground text-sm">Aucune adoption récente</p>
			{/each}
		</div>
	</section>
</main>
