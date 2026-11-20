<script lang="ts">
	import { urlFilter, syncFiltersToUrl } from '#lib/navigation/urlFilters.svelte.ts';
	import { filterChips } from '#lib/tables/filterChips.ts';
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import { desktop } from '#lib/utils/media.svelte.ts';
	import StatCards from '#lib/components/cards/StatCards.svelte';
	import CandidateRow from '#lib/components/invitations/CandidateRow.svelte';
	import CandidatePanel from '#lib/components/invitations/CandidatePanel.svelte';
	import PendingCandidatesBanner from '#lib/components/invitations/PendingCandidatesBanner.svelte';
	import HostProfile from '#lib/components/hosts/panel/HostProfile.svelte';
	import HostDescriptions from '#lib/components/hosts/panel/HostDescriptions.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import {
		PENDING_FILTER,
		PENDING_FILTER_OPTION,
		matchesCandidateSearch
	} from '#lib/constants/invitation.ts';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { BLACKLIST_FILTER_OPTIONS, matchesBlacklistFilter } from '#lib/constants/blacklist.ts';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import HostRow from '#lib/components/hosts/HostRow.svelte';
	import HostPanel from '#lib/components/hosts/HostPanel.svelte';
	import NewHostDialog from '#lib/components/hosts/NewHostDialog.svelte';
	import {
		HOST_ACTIF_OPTIONS,
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS,
		HOST_TYPES
	} from '#lib/constants/host.js';
	import { fade, fly } from 'svelte/transition';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import {
		linkedId,
		rememberSelection,
		scrollToRow,
		takeNewParam
	} from '#lib/navigation/entityLink.ts';
	import { afterNavigate } from '$app/navigation';

	const { data } = $props();

	const hosts = $derived(data.hosts);
	const stats = $derived(data.stats);

	const candidates = $derived(data.invitations);

	// La ligne choisie : une FA, ou une candidature (invitation pas encore acceptée)
	let selectedHostId = $state<string | null>(null);
	const selectedHost = $derived(hosts.find((h) => h.id === selectedHostId) ?? null);
	const selectedCandidate = $derived(candidates.find((c) => c.id === selectedHostId) ?? null);
	const selectedHostName = $derived(
		selectedHost
			? `${selectedHost.profil.firstName} ${selectedHost.profil.lastName}`
			: (selectedCandidate?.name ?? "Détail de la famille d'accueil")
	);

	let mobilePanelOpen = $state(false);
	let newHostOpen = $state(false);

	// « Créer » depuis le dashboard (?nouveau=1) : le formulaire s'ouvre tout de suite
	afterNavigate(() => {
		if (takeNewParam()) newHostOpen = true;
	});

	// Filtres
	let typeFilter = $state(urlFilter('type'));
	let actifFilter = $state(urlFilter('statut', 'ACTIVE'));
	let blacklistFilter = $state(urlFilter('blacklist'));
	let healFilter = $state(urlFilter('soins'));
	let socializeFilter = $state(urlFilter('sociabilisation'));
	let babyFilter = $state(urlFilter('biberonnage'));
	let searchQuery = $state('');

	// Le filtre « Statut » propose aussi « En attente de validation » : les candidatures seules
	const statusOptions = [...HOST_ACTIF_OPTIONS, PENDING_FILTER_OPTION];
	const showCandidates = $derived(actifFilter === PENDING_FILTER);
	const filteredCandidates = $derived(
		showCandidates ? candidates.filter((c) => matchesCandidateSearch(c, searchQuery)) : []
	);

	function showPendingCandidates() {
		clearFilters();
		actifFilter = PENDING_FILTER;
	}

	// Candidature annulée : plus rien à afficher
	function handleCandidateCancelled() {
		selectedHostId = null;
		mobilePanelOpen = false;
		rememberSelection(null);
	}

	// Lien renvoyé : c'est une NOUVELLE invitation, on la sélectionne
	function handleCandidateResent(invitationId: string) {
		selectedHostId = invitationId;
		rememberSelection(invitationId);
	}

	function selectHost(hostId: string) {
		selectedHostId = hostId;
		if (!desktop.current) mobilePanelOpen = true;
	}

	// Clic sur une ligne : on garde aussi son id dans l'adresse (le bouton « Retour » la rouvrira)
	function handleSelectHost(hostId: string) {
		selectHost(hostId);
		rememberSelection(hostId);
	}

	// Arrivée par un nom cliquable (?id=…) : on ouvre son panneau
	$effect(() => {
		const id = linkedId();
		if (id && id !== untrack(() => selectedHostId)) untrack(() => openFromLink(id));
	});

	function openFromLink(id: string) {
		// Une candidature : on passe sur le filtre « En attente »
		if (candidates.some((c) => c.id === id)) {
			showPendingCandidates();
			selectHost(id);
			scrollToRow(id);
			return;
		}
		if (!hosts.some((h) => h.id === id)) {
			toast.error("Cette famille d'accueil n'est plus dans la liste.");
			return;
		}
		// Cachée par un filtre (ex : en pause, alors que la liste montre « Actif ») : on les retire
		if (!filteredHosts.some((h) => h.id === id)) {
			clearFilters();
			if (!filteredHosts.some((h) => h.id === id)) actifFilter = '';
		}
		selectHost(id);
		scrollToRow(id);
	}

	function clearFilters() {
		typeFilter = '';
		actifFilter = 'ACTIVE';
		blacklistFilter = '';
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
		if (blacklistFilter)
			filtered = filtered.filter((h) =>
				matchesBlacklistFilter(blacklistFilter, h.profil.blacklists)
			);
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

	// ===== FILTRES DANS L'ADRESSE ET PUCES DES FILTRES ACTIFS =====
	// Un rechargement garde les filtres, et le lien d'une liste filtrée peut s'envoyer
	syncFiltersToUrl(
		() => ({
			type: typeFilter,
			statut: actifFilter,
			soins: healFilter,
			sociabilisation: socializeFilter,
			biberonnage: babyFilter,
			blacklist: blacklistFilter
		}),
		{ statut: 'ACTIVE' }
	);
	const chips = $derived(
		filterChips([
			{
				name: 'Type',
				value: typeFilter,
				options: HOST_TYPE_OPTIONS,
				clear: () => (typeFilter = '')
			},
			{
				name: 'Statut',
				value: actifFilter,
				options: statusOptions,
				clear: () => (actifFilter = '')
			},
			{
				name: 'Soins',
				value: healFilter,
				options: HOST_HEAL_OPTIONS,
				clear: () => (healFilter = '')
			},
			{
				name: 'Sociabilisation',
				value: socializeFilter,
				options: HOST_SOCIALIZE_OPTIONS,
				clear: () => (socializeFilter = '')
			},
			{
				name: 'Biberonnage',
				value: babyFilter,
				options: HOST_BABY_FEEDING_OPTIONS,
				clear: () => (babyFilter = '')
			},
			{
				name: 'Blacklist',
				value: blacklistFilter,
				options: BLACKLIST_FILTER_OPTIONS,
				clear: () => (blacklistFilter = '')
			}
		])
	);
</script>

<svelte:head>
	<title>Familles d'accueil – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<!-- Le titre de la page, pour les lecteurs d'écran et les moteurs de recherche -->
	<h1 class="sr-only">Familles d'accueil</h1>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<StatCards cards={statCards} class="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" />

		<!-- ================= LISTE + DÉTAIL ================= -->
		<ListDetailLayout bind:open={mobilePanelOpen} title={selectedHostName}>
			{#snippet list()}
				<!-- LISTE : sur PC, sa hauteur suit celle du panneau -->
				<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-14rem)]">
					<Card.Root class="flex flex-col lg:absolute lg:inset-0">
						<Card.Header
							class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2"
						>
							<Card.Title class="text-xl font-bold sm:text-2xl">
								Familles d'accueil
								<span class="text-base font-normal text-muted-foreground">
									({showCandidates ? filteredCandidates.length : filteredHosts.length})
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
								{chips}
							>
								{#snippet filters()}
									<SelectField
										id="host-filter-type"
										label=""
										options={HOST_TYPE_OPTIONS}
										bind:value={typeFilter}
										placeholder="Type"
										class="w-full sm:w-48"
									/>
									<SelectField
										id="host-filter-status"
										label=""
										options={statusOptions}
										bind:value={actifFilter}
										placeholder="Statut"
										class="w-full sm:w-48"
									/>
									<SelectField
										id="host-filter-heal"
										label=""
										options={HOST_HEAL_OPTIONS}
										bind:value={healFilter}
										placeholder="Soins"
										class="w-full sm:w-48"
									/>
									<SelectField
										id="host-filter-socialize"
										label=""
										options={HOST_SOCIALIZE_OPTIONS}
										bind:value={socializeFilter}
										placeholder="Sociabilisation"
										class="w-full sm:w-48"
									/>
									<SelectField
										id="host-filter-baby"
										label=""
										options={HOST_BABY_FEEDING_OPTIONS}
										bind:value={babyFilter}
										placeholder="Biberonnage"
										class="w-full sm:w-48"
									/>
									<SelectField
										id="host-blacklist-filter"
										label=""
										options={BLACKLIST_FILTER_OPTIONS}
										bind:value={blacklistFilter}
										placeholder="Blacklist"
										class="w-40"
									/>
								{/snippet}
							</TableToolbar>

							<!-- Les candidatures en attente : un clic applique le filtre -->
							<PendingCandidatesBanner
								count={candidates.length}
								active={showCandidates}
								onShow={showPendingCandidates}
								onHide={clearFilters}
							/>

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
										{#if showCandidates}
											{#each filteredCandidates as candidate (candidate.id)}
												<CandidateRow
													{candidate}
													columns={8}
													onclick={() => handleSelectHost(candidate.id)}
													isSelected={selectedHostId === candidate.id}
												/>
											{:else}
												<Table.Row>
													<Table.Cell colspan={8} class="text-muted-foreground py-10 text-center">
														Aucune candidature en attente.
													</Table.Cell>
												</Table.Row>
											{/each}
										{:else}
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
										{/if}
									</Table.Body>
								</Table.Root>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/snippet}

			{#snippet detail()}
				{#if selectedCandidate}
					<CandidatePanel
						candidate={selectedCandidate}
						documentName="la Convention FA"
						isAdmin={data.isAdmin}
						onResent={handleCandidateResent}
						onCancelled={handleCandidateCancelled}
					>
						{#snippet details()}
							{#if selectedCandidate.host}
								<div class="flex items-center gap-2">
									<span class="text-muted-foreground">Type d'accueil prévu :</span>
									<Badge variant="outline">
										{selectedCandidate.host.type
											? HOST_TYPES[selectedCandidate.host.type].label
											: '—'}
									</Badge>
								</div>
								<HostProfile host={selectedCandidate.host} />
								<Separator />
								<HostDescriptions host={selectedCandidate.host} />
							{/if}
						{/snippet}
					</CandidatePanel>
				{:else}
					<HostPanel host={selectedHost} isAdmin={data.isAdmin} />
				{/if}
			{/snippet}
		</ListDetailLayout>
	</div>
</main>

<NewHostDialog
	bind:open={newHostOpen}
	onCancel={() => {
		newHostOpen = false;
	}}
/>
