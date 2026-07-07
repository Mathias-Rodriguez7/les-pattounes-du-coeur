<script lang="ts">
	import SectionHeader from '$lib/components/dashboard/SectionHeader.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import BarChartVolunteerCats from '$lib/components/charts/RadialChartVolunteerCats.svelte';
	import RadialChartVolunteerAdoptions from '$lib/components/charts/RadialChartVolunteerAdoptions.svelte';
	import RadarChartCatStatus from '$lib/components/charts/RadarChartCatStatus.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const user = $derived(data.user);
	const stats = $derived(data.stats ?? {});
	const taskGroups = $derived(data.taskGroups ?? []);
	const quickActions = $derived(data.quickActions ?? []);
	const volunteerStats = $derived(data.volunteerStats ?? []);
	const radarChartData = $derived(data.radarChartData ?? []);

	const iconMap: Record<string, string> = {
		cat: 'cat',
		house: 'house',
		mail: 'mail',
		users: 'users',
		clipboard: 'clipboard',
		news: 'news'
	};
</script>

<main class="mx-auto flex w-full flex-col gap-8 px-8 py-6">
	<!-- ============================================ -->
	<!-- HEADER -->
	<!-- ============================================ -->
	<header class="flex items-center justify-between">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-bold tracking-tight">
				Bonjour {user?.firstName} 👋
			</h1>
		</div>
	</header>

	<!-- ============================================ -->
	<!-- LAYOUT PRINCIPAL (2 COLONNES) -->
	<!-- ============================================ -->
	<div
		class="flex flex-col gap-8 lg:min-h-[calc(100vh-550px)] lg:flex-row xl:min-h-[calc(100vh-560px)]"
	>
		<!-- COLONNE GAUCHE (70%) -->
		<div class="flex flex-col gap-8 lg:flex-1">
			<!-- SECTION 3: ACTIONS RAPIDES -->
			<section class="flex flex-col gap-4">
				<SectionHeader title="Actions rapides" />
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
					{#each quickActions as action (action.label)}
						<a href={action.href} class="group">
							<div
								class="border-border bg-card hover:border-primary/50 rounded-xl border p-4 transition-all hover:shadow-md"
							>
								<div class="flex items-start gap-4">
									<Icon
										name={iconMap[action.icon] || 'plus'}
										withWrapper={true}
										wrapperClass="from-accent to-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg shrink-0"
										iconClass="h-5 w-5 text-white"
									/>
									<div class="flex min-w-0 flex-col gap-1">
										<span class="group-hover:text-primary text-sm font-semibold transition-colors"
											>{action.label}</span
										>
										<span class="text-muted-foreground text-xs">{action.description}</span>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</section>

			<!-- SECTION 1: À TRAITER -->
			<section class="flex flex-col gap-4">
				<SectionHeader title="À traiter" />

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each taskGroups as group (group.theme)}
						<div class="border-border bg-card rounded-xl border p-6">
							<div class="mb-6 flex items-center gap-3">
								<Icon
									name={iconMap[group.icon] || 'paw'}
									withWrapper={true}
									wrapperClass="from-accent to-primary flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
									iconClass="h-5 w-5 text-white"
								/>
								<h3 class="font-semibold">{group.theme}</h3>
							</div>

							{#if group.tasks.length > 0}
								<div class="flex flex-col gap-3">
									{#each group.tasks as task (task.label)}
										<a
											href={task.href || '#'}
											class="hover:border-primary/50 flex flex-col gap-2 rounded-lg p-4 transition-all hover:shadow-md"
										>
											<div class="flex items-center justify-between">
												<p class="text-sm font-medium">{task.label}</p>
												<span
													class="bg-primary/10 text-primary inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
												>
													{task.value}
												</span>
											</div>
											<p class="text-muted-foreground text-xs">{task.description}</p>
										</a>
										<Separator />
									{/each}
								</div>
							{:else}
								<p class="text-muted-foreground text-xs">Aucune tâche</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		</div>

		<!-- COLONNE DROITE (30%) - SIDEBAR STATS -->
		<aside class="flex flex-col gap-4 lg:min-h-full lg:w-80">
			<SectionHeader title="Vue d'ensemble" />

			<div
				class="border-border bg-card flex flex-1 flex-col justify-between overflow-hidden rounded-xl border"
			>
				<!-- Chats gérés par le bénévole vs total -->
				<div class="px-6 py-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Icon
								name="cat"
								withWrapper={true}
								wrapperClass="from-blue-500 to-blue-600 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
								iconClass="h-5 w-5 text-white"
							/>
							<div class="flex flex-col gap-1">
								<p class="text-muted-foreground text-xs font-medium uppercase">Chats gérés</p>
								<p class="text-muted-foreground text-xs">vs total association</p>
							</div>
						</div>
						<div class="flex flex-col items-end gap-1">
							<p class="text-primary text-2xl font-bold">
								{stats.volunteerCatsManaged ?? 0}/{stats.totalAssociationCats ?? 0}
							</p>
							<p class="text-muted-foreground text-xs font-medium">
								{#if stats.totalAssociationCats}
									{Math.round((stats.volunteerCatsManaged / stats.totalAssociationCats) * 100)}%
								{:else}
									0%
								{/if}
							</p>
						</div>
					</div>
				</div>

				<Separator />

				<!-- FA libres vs actives -->
				<div class="px-6 py-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Icon
								name="house"
								withWrapper={true}
								wrapperClass="from-green-500 to-green-600 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
								iconClass="h-5 w-5 text-white"
							/>
							<div class="flex flex-col gap-1">
								<p class="text-muted-foreground text-xs font-medium uppercase">FA libres</p>
								<p class="text-muted-foreground text-xs">vs actives</p>
							</div>
						</div>
						<div class="flex flex-col items-end gap-1">
							<p class="text-primary text-2xl font-bold">
								{stats.availableHostFamilies ?? 0}/{stats.totalActiveHosts ?? 0}
							</p>
							<p class="text-muted-foreground text-xs font-medium">
								{#if stats.totalActiveHosts}
									{Math.round(
										((stats.availableHostFamilies ?? 0) / (stats.totalActiveHosts ?? 1)) * 100
									)}%
								{:else}
									0%
								{/if}
							</p>
						</div>
					</div>
				</div>

				<Separator />

				<!-- Adoptions bénévole vs année -->
				<div class="px-6 py-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Icon
								name="paw"
								withWrapper={true}
								wrapperClass="from-orange-500 to-orange-600 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
								iconClass="h-5 w-5 text-white"
							/>
							<div class="flex flex-col gap-1">
								<p class="text-muted-foreground text-xs font-medium uppercase">Adoptions</p>
								<p class="text-muted-foreground text-xs">vs année</p>
							</div>
						</div>
						<div class="flex flex-col items-end gap-1">
							<p class="text-primary text-2xl font-bold">
								{stats.volunteerAdoptions ?? 0}/{stats.totalYearAdoptions ?? 0}
							</p>
							<p class="text-muted-foreground text-xs font-medium">
								{#if stats.totalYearAdoptions}
									{Math.round(
										((stats.volunteerAdoptions ?? 0) / (stats.totalYearAdoptions ?? 1)) * 100
									)}%
								{:else}
									0%
								{/if}
							</p>
						</div>
					</div>
				</div>

				<Separator />

				<!-- Bénévoles actifs -->
				<div class="px-6 py-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Icon
								name="users"
								withWrapper={true}
								wrapperClass="from-purple-500 to-purple-600 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
								iconClass="h-5 w-5 text-white"
							/>
							<div class="flex flex-col gap-1">
								<p class="text-muted-foreground text-xs font-medium uppercase">Bénévoles actifs</p>
								<p class="text-muted-foreground text-xs">association</p>
							</div>
						</div>
						<div class="flex flex-col items-end gap-1">
							<p class="text-primary text-2xl font-bold">{stats.totalVolunteers ?? 0}</p>
							<p class="text-muted-foreground text-xs font-medium">actifs</p>
						</div>
					</div>
				</div>
			</div>
		</aside>
	</div>

	<!-- SECTION 2: GRAPHIQUES & MÉTRIQUES -->
	<section class="flex flex-col gap-4">
		<SectionHeader title="Mes Stats" />

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<!-- GRAPHIQUE 1: Chats gérés par bénévole -->
			<div class="border-border bg-card rounded-xl border p-6">
				<div class="mb-6 flex items-center gap-3">
					<Icon
						name="cat"
						withWrapper={true}
						wrapperClass="from-blue-500 to-cyan-500 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						iconClass="h-5 w-5 text-white"
					/>
					<h3 class="font-semibold">Chats gérés par bénévole (année en cours)</h3>
				</div>
				{#if volunteerStats.length > 0}
					<BarChartVolunteerCats totalCats={380} volunteerCats={63} />
				{:else}
					<div class="flex h-64 items-center justify-center">
						<p class="text-muted-foreground text-sm">Pas de données disponibles</p>
					</div>
				{/if}
			</div>

			<!-- GRAPHIQUE 2: Chats adoptés par bénévole -->
			<div class="border-border bg-card rounded-xl border p-6">
				<div class="mb-6 flex items-center gap-3">
					<Icon
						name="paw"
						withWrapper={true}
						wrapperClass="from-green-500 to-emerald-500 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						iconClass="h-5 w-5 text-white"
					/>
					<h3 class="font-semibold">Chats adoptés par bénévole (année en cours)</h3>
				</div>
				{#if volunteerStats.length > 0}
					<RadialChartVolunteerAdoptions totalAdoptions={150} volunteerAdoptions={45} />
				{:else}
					<div class="flex h-64 items-center justify-center">
						<p class="text-muted-foreground text-sm">Pas de données disponibles</p>
					</div>
				{/if}
			</div>

			<!-- GRAPHIQUE 3: Radar Chart des statuts -->
			<div class="border-border bg-card rounded-xl border p-6">
				<div class="mb-6 flex items-center gap-3">
					<Icon
						name="clipboard"
						withWrapper={true}
						wrapperClass="from-purple-500 to-pink-500 flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg"
						iconClass="h-5 w-5 text-white"
					/>
					<h3 class="font-semibold">Distribution des statuts par bénévole</h3>
				</div>
				{#if radarChartData.length > 0}
					<RadarChartCatStatus
						allCatsData={{
							AVAILABLE: 15,
							SOCIALIZE: 18,
							ADOPTED: 10,
							FREE: 7
						}}
						volunteerCatsData={{
							AVAILABLE: 6,
							SOCIALIZE: 9,
							ADOPTED: 5,
							FREE: 1
						}}
					/>
				{:else}
					<div class="flex h-96 items-center justify-center">
						<p class="text-muted-foreground text-sm">Pas de données disponibles</p>
					</div>
				{/if}
			</div>
		</div>
	</section>
</main>
