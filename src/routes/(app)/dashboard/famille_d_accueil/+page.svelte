<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import HostRow from '$lib/components/hosts/HostRow.svelte';
	import HostPanel from '$lib/components/hosts/HostPanel.svelte';
	import NewHostDialog from '$lib/components/hosts/NewHostDialog.svelte';
	import {
		HOST_ACTIF_OPTIONS,
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS
	} from '$lib/constants/host.js';
	import { X } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';
	import TableToolbar from '$lib/components/tables/TableToolbar.svelte';

	const { data } = $props();

	const hosts = $derived(data.hosts);
	const stats = $derived(data.stats);

	// true à partir de 1024 px (valeur supposée côté serveur : ordinateur)
	const isDesktop = new MediaQuery('min-width: 1024px', true);

	let selectedHostId = $state<string | null>(null);
	const selectedHost = $derived(hosts.find((h) => h.id === selectedHostId) ?? null);
	const selectedHostName = $derived(
		selectedHost
			? `${selectedHost.profil.firstName} ${selectedHost.profil.lastName}`
			: "Détail de la famille d'accueil"
	);

	let mobilePanelOpen = $state(false);
	let newHostOpen = $state(false);

	// Filtres
	let typeFilter = $state('');
	let actifFilter = $state('ACTIVE');
	let healFilter = $state('');
	let socializeFilter = $state('');
	let babyFilter = $state('');
	let searchQuery = $state('');

	function handleSelectHost(hostId: string) {
		selectedHostId = hostId;
		if (!isDesktop.current) mobilePanelOpen = true;
	}

	function clearFilters() {
		typeFilter = '';
		actifFilter = 'ACTIVE';
		healFilter = '';
		socializeFilter = '';
		babyFilter = '';
		searchQuery = '';
	}

	const statCards = $derived([
		{ label: "FA dans l'association", value: stats.totalHosts, icon: 'house', theme: 'fa' },
		{ label: 'Profils incomplets', value: stats.incompleteProfiles, icon: 'alert', theme: 'dog' },
		{ label: 'FA actives', value: stats.activeHosts, icon: 'CirclePlay', theme: 'activ' },
		{ label: 'FA en pause', value: stats.breakHosts, icon: 'CirclePause', theme: 'break' },
		{
			label: 'Recrutées cette année',
			value: stats.recruitedThisYear,
			icon: 'Handshake',
			theme: 'adoptions'
		}
	]);

	const iconColumns = [
		{ icon: 'syringe', theme: 'activ', title: 'Soins' },
		{ icon: 'cat', theme: 'cats', title: 'Chats placés' },
		{ icon: 'trees', theme: 'fa', title: 'Extérieur' }
	];

	const filteredHosts = $derived.by(() => {
		let filtered = hosts;

		if (typeFilter) filtered = filtered.filter((h) => h.type === typeFilter);
		if (actifFilter) filtered = filtered.filter((h) => h.actif === actifFilter);
		if (healFilter) filtered = filtered.filter((h) => h.heal === healFilter);
		if (socializeFilter) filtered = filtered.filter((h) => h.socialize === socializeFilter);
		if (babyFilter) filtered = filtered.filter((h) => h.babyFeeding === babyFilter);

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter((h) => {
				const fullName = `${h.profil.firstName ?? ''} ${h.profil.lastName ?? ''}`.toLowerCase();
				return fullName.includes(query);
			});
		}

		return filtered;
	});
</script>

<svelte:head>
	<title>Familles d'accueil – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<section class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
			{#each statCards as card, i (card.label)}
				<Card.Root class="gap-2 py-4 {i === 0 ? 'col-span-2 sm:col-span-1' : ''}">
					<Card.Header class="flex flex-row items-start justify-between gap-2 px-4">
						<Card.Title class="text-xs font-medium text-muted-foreground sm:text-sm">
							{card.label}
						</Card.Title>
						<Icon
							name={card.icon}
							withWrapper={true}
							wrapperClass="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-lg sm:size-10 sm:rounded-2xl"
							style="background: {getGradientStyle(card.theme)}"
							iconClass="size-4 sm:size-5"
						/>
					</Card.Header>
					<Card.Content class="px-4">
						<p class="text-xl font-bold sm:text-2xl">{card.value}</p>
					</Card.Content>
				</Card.Root>
			{/each}
		</section>

		<!-- ================= LISTE + DÉTAIL ================= -->
		<section class="grid grid-cols-1 gap-4 lg:grid-cols-5">
			<!-- LISTE : sur PC, sa hauteur suit celle du panneau -->
			<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-14rem)]">
				<Card.Root class="flex flex-col lg:absolute lg:inset-0">
					<Card.Header class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2">
						<Card.Title class="text-xl font-bold sm:text-2xl">
							Familles d'accueil
							<span class="text-base font-normal text-muted-foreground">
								({filteredHosts.length})
							</span>
						</Card.Title>
						<Button class="rounded-2xl" size="sm" onclick={() => (newHostOpen = true)}>
							<Icon name="plus" class="h-4 w-4" />
							<span class="hidden sm:inline">Nouvelle FA</span>
							<span class="sm:hidden">Ajouter</span>
						</Button>
					</Card.Header>

					<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
						<TableToolbar
							bind:search={searchQuery}
							searchPlaceholder="Rechercher une FA…"
							searchLabel="Chercher une famille d'accueil"
							onReset={clearFilters}
						>
							{#snippet filters()}
								<SelectField
									id="host-filter-type"
									label=""
									options={HOST_TYPE_OPTIONS}
									bind:value={typeFilter}
									placeholder="Type"
									class="w-full sm:w-36"
								/>
								<SelectField
									id="host-filter-status"
									label=""
									options={HOST_ACTIF_OPTIONS}
									bind:value={actifFilter}
									placeholder="Statut"
									class="w-full sm:w-36"
								/>
								<SelectField
									id="host-filter-heal"
									label=""
									options={HOST_HEAL_OPTIONS}
									bind:value={healFilter}
									placeholder="Soins"
									class="w-full sm:w-36"
								/>
								<SelectField
									id="host-filter-socialize"
									label=""
									options={HOST_SOCIALIZE_OPTIONS}
									bind:value={socializeFilter}
									placeholder="Sociabilisation"
									class="w-full sm:w-36"
								/>
								<SelectField
									id="host-filter-baby"
									label=""
									options={HOST_BABY_FEEDING_OPTIONS}
									bind:value={babyFilter}
									placeholder="Biberonnage"
									class="w-full sm:w-36"
								/>
							{/snippet}
						</TableToolbar>

						<!-- Tableau -->
						<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
							<Table.Root containerClass="overflow-visible">
								<Table.Header
									class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
								>
									<Table.Row>
										<Table.Head>Nom</Table.Head>
										<Table.Head>Type</Table.Head>
										<Table.Head class="hidden text-center sm:table-cell">Animaux</Table.Head>
										<Table.Head class="hidden sm:table-cell">Socia.</Table.Head>
										{#each iconColumns as col (col.title)}
											<Table.Head title={col.title} class="hidden text-center sm:table-cell">
												<div class="flex justify-center text-white">
													<Icon
														name={col.icon}
														withWrapper={true}
														wrapperClass="flex h-8 w-8 items-center justify-center rounded-lg"
														style="background: {getGradientStyle(col.theme)}"
														iconClass="h-5 w-5"
													/>
												</div>
											</Table.Head>
										{/each}
										<Table.Head class="w-8 sm:hidden"
											><span class="sr-only">Ouvrir</span></Table.Head
										>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each filteredHosts as host (host.id)}
										<HostRow
											{host}
											onclick={() => handleSelectHost(host.id)}
											isSelected={selectedHostId === host.id}
										/>
									{:else}
										<Table.Row>
											<Table.Cell colspan={8} class="text-muted-foreground py-10 text-center">
												Aucune famille d'accueil ne correspond à ces filtres.
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- DÉTAIL : ordinateur -->
			{#if isDesktop.current}
				<div class="min-w-0 lg:col-span-3">
					<HostPanel host={selectedHost} isAdmin={data.isAdmin} />
				</div>
			{/if}
		</section>
	</div>
</main>

<!-- DÉTAIL : plein écran sur mobile -->
{#if !isDesktop.current}
	<Sheet.Root bind:open={mobilePanelOpen}>
		<Sheet.Content
			side="right"
			showCloseButton={false}
			class="gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none"
		>
			<header
				class="sticky top-0 z-10 flex items-center gap-2 border-b bg-card/95 px-4 py-2 backdrop-blur"
			>
				<Sheet.Title class="min-w-0 flex-1 truncate text-base font-semibold">
					{selectedHostName}
				</Sheet.Title>
				<Sheet.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Fermer et revenir à la liste"
				>
					<X class="size-5" />
				</Sheet.Close>
			</header>

			<div class="p-3">
				<HostPanel host={selectedHost} isAdmin={data.isAdmin} />
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}

<NewHostDialog
	bind:open={newHostOpen}
	onCancel={() => {
		newHostOpen = false;
	}}
/>
