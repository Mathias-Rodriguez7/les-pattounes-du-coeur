<script lang="ts">
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import { desktop } from '#lib/utils/media.svelte.ts';
	import StatCards from '#lib/components/cards/StatCards.svelte';
	import CandidateRow from '#lib/components/invitations/CandidateRow.svelte';
	import CandidatePanel from '#lib/components/invitations/CandidatePanel.svelte';
	import PendingCandidatesBanner from '#lib/components/invitations/PendingCandidatesBanner.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import {
		PENDING_FILTER,
		PENDING_FILTER_OPTION,
		matchesCandidateSearch
	} from '#lib/constants/invitation.ts';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { getGradientStyle } from '#lib/utils/iconThemes.ts';
	import VolunteerRow from '#lib/components/volunteers/VolunteerRow.svelte';
	import VolunteerPanel from '#lib/components/volunteers/VolunteerPanel.svelte';
	import NewVolunteerDialog from '#lib/components/volunteers/NewVolunteerDialog.svelte';
	import { BLACKLIST_FILTER_OPTIONS, matchesBlacklistFilter } from '#lib/constants/blacklist.ts';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import {
		VOLUNTEER_ROLE_OPTIONS,
		VOLUNTEER_STATUS_OPTIONS,
		roleColors
	} from '#lib/constants/volunteer.js';
	import { fade, fly } from 'svelte/transition';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { linkedId, rememberSelection, scrollToRow } from '#lib/navigation/entityLink.ts';

	const { data } = $props();

	const volunteers = $derived(data.volunteers);
	const stats = $derived(data.stats);

	const candidates = $derived(data.invitations);

	// La ligne choisie : une bénévole, ou une candidature (invitation pas encore acceptée)
	let selectedVolunteerId = $state<string | null>(null);
	const selectedVolunteer = $derived(volunteers.find((v) => v.id === selectedVolunteerId) ?? null);
	const selectedCandidate = $derived(candidates.find((c) => c.id === selectedVolunteerId) ?? null);
	const selectedVolunteerName = $derived(
		selectedVolunteer
			? `${selectedVolunteer.profil.firstName} ${selectedVolunteer.profil.lastName}`
			: (selectedCandidate?.name ?? 'Détail du bénévole')
	);

	// Tiroir du détail : utilisé uniquement sur mobile
	let mobilePanelOpen = $state(false);

	let searchQuery = $state('');
	let actifFilter = $state('ACTIVE');
	let blacklistFilter = $state('');
	let roleFilter = $state('');
	let newVolunteerOpen = $state(false);

	// Le filtre « Statut » propose aussi « En attente de validation » : les candidatures seules
	const statusOptions = [...VOLUNTEER_STATUS_OPTIONS, PENDING_FILTER_OPTION];
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
		selectedVolunteerId = null;
		mobilePanelOpen = false;
		rememberSelection(null);
	}

	// Lien renvoyé : c'est une NOUVELLE invitation, on la sélectionne
	function handleCandidateResent(invitationId: string) {
		selectedVolunteerId = invitationId;
		rememberSelection(invitationId);
	}

	function selectVolunteer(volunteerId: string) {
		selectedVolunteerId = volunteerId;
		if (!desktop.current) mobilePanelOpen = true;
	}

	// Clic sur une ligne : on garde aussi son id dans l'adresse (le bouton « Retour » la rouvrira)
	function handleSelectVolunteer(volunteerId: string) {
		selectVolunteer(volunteerId);
		rememberSelection(volunteerId);
	}

	// Arrivée par un nom cliquable (?id=…) : on ouvre son panneau
	$effect(() => {
		const id = linkedId();
		if (id && id !== untrack(() => selectedVolunteerId)) untrack(() => openFromLink(id));
	});

	function openFromLink(id: string) {
		// Une candidature : on passe sur le filtre « En attente »
		if (candidates.some((c) => c.id === id)) {
			showPendingCandidates();
			selectVolunteer(id);
			scrollToRow(id);
			return;
		}
		if (!volunteers.some((v) => v.id === id)) {
			toast.error("Ce bénévole n'est plus dans la liste.");
			return;
		}
		// Cachée par un filtre (ex : en pause, alors que la liste montre « Actif ») : on les retire
		if (!filteredVolunteers.some((v) => v.id === id)) {
			clearFilters();
			if (!filteredVolunteers.some((v) => v.id === id)) actifFilter = '';
		}
		selectVolunteer(id);
		scrollToRow(id);
	}

	function clearFilters() {
		actifFilter = 'ACTIVE';
		blacklistFilter = '';
		roleFilter = '';
		searchQuery = '';
	}

	const statCards = $derived([
		{
			label: "Bénévoles dans l'association",
			value: stats.totalVolunteers,
			icon: 'users',
			theme: 'cats'
		},
		{ label: 'Profils incomplets', value: stats.incompleteProfiles, icon: 'alert', theme: 'dog' },
		{ label: 'En activité', value: stats.activeVolunteers, icon: 'CirclePlay', theme: 'activ' },
		{ label: 'En pause', value: stats.pausedVolunteers, icon: 'CirclePause', theme: 'break' },
		{
			label: 'Recrutés cette année',
			value: stats.recruitedThisYear,
			icon: 'Handshake',
			theme: 'adoptions'
		}
	]);

	const filteredVolunteers = $derived.by(() => {
		let filtered = volunteers;

		if (actifFilter) filtered = filtered.filter((v) => v.actif === actifFilter);
		if (blacklistFilter)
			filtered = filtered.filter((v) =>
				matchesBlacklistFilter(blacklistFilter, v.profil.blacklists)
			);
		if (roleFilter) filtered = filtered.filter((v) => v.role === roleFilter);

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter((v) => {
				const fullName = `${v.profil.firstName ?? ''} ${v.profil.lastName ?? ''}`.toLowerCase();
				return fullName.includes(query);
			});
		}

		return filtered;
	});

	// En-têtes cohérents avec les données affichées par VolunteerRow
	const countColumns = [
		{ icon: 'cat', theme: 'cats', title: 'Chats suivis' },
		{ icon: 'clipboard', theme: 'pending', title: 'Formulaires assignés' }
	];
</script>

<svelte:head>
	<title>Bénévoles – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<StatCards cards={statCards} class="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" featureFirst />

		<!-- ================= LISTE + DÉTAIL ================= -->
		<ListDetailLayout bind:open={mobilePanelOpen} title={selectedVolunteerName}>
			{#snippet list()}
				<!-- LISTE : sur PC, sa hauteur suit celle du panneau (avec une hauteur minimale) -->
				<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-14rem)]">
					<Card.Root class="flex flex-col lg:absolute lg:inset-0">
						<Card.Header
							class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2"
						>
							<Card.Title class="text-xl font-bold sm:text-2xl">
								Bénévoles
								<span class="text-base font-normal text-muted-foreground">
									({showCandidates ? filteredCandidates.length : filteredVolunteers.length})
								</span>
							</Card.Title>
							<Button class="rounded-2xl" size="sm" onclick={() => (newVolunteerOpen = true)}>
								<Icon name="plus" class="h-4 w-4" />
								<span class="hidden sm:inline">Nouveau bénévole</span>
								<span class="sm:hidden">Ajouter</span>
							</Button>
						</Card.Header>

						<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
							<!-- Filtres -->
							<TableToolbar
								bind:search={searchQuery}
								searchPlaceholder="Chercher un bénévole…"
								searchLabel="Chercher un bénévole par nom"
								onReset={clearFilters}
							>
								{#snippet filters()}
									<SelectField
										id="volunteer-status-filter"
										label=""
										options={statusOptions}
										bind:value={actifFilter}
										placeholder="Statut"
										class="w-32"
									/>
									<SelectField
										id="volunteer-role-filter"
										label=""
										options={VOLUNTEER_ROLE_OPTIONS}
										bind:value={roleFilter}
										placeholder="Rôle"
										class="w-32"
									/>
									<SelectField
										id="volunteer-blacklist-filter"
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

							<!-- Tableau : prend l'espace restant et défile dans la carte sur PC -->
							<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
								<Table.Root containerClass="overflow-visible">
									<Table.Header
										class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
									>
										<Table.Row>
											<Table.Head>Nom</Table.Head>
											<Table.Head>Rôle</Table.Head>
											<Table.Head class="hidden sm:table-cell">Quartier</Table.Head>
											{#each countColumns as col (col.title)}
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
											<!-- Colonne de la flèche : mobile uniquement -->
											<Table.Head class="w-8 sm:hidden">
												<span class="sr-only">Ouvrir</span>
											</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#if showCandidates}
											{#each filteredCandidates as candidate (candidate.id)}
												<CandidateRow
													{candidate}
													columns={6}
													onclick={() => handleSelectVolunteer(candidate.id)}
													isSelected={selectedVolunteerId === candidate.id}
												/>
											{:else}
												<Table.Row>
													<Table.Cell colspan={6} class="text-muted-foreground py-10 text-center">
														Aucune candidature en attente.
													</Table.Cell>
												</Table.Row>
											{/each}
										{:else}
											{#each filteredVolunteers as volunteer (volunteer.id)}
												<VolunteerRow
													{volunteer}
													onclick={() => handleSelectVolunteer(volunteer.id)}
													isSelected={selectedVolunteerId === volunteer.id}
												/>
											{:else}
												<Table.Row>
													<Table.Cell colspan={6} class="text-muted-foreground py-10 text-center">
														Aucun bénévole ne correspond à ces filtres.
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
						documentName="le Manuel de la gestionnaire"
						isAdmin={data.isAdmin}
						onResent={handleCandidateResent}
						onCancelled={handleCandidateCancelled}
					>
						{#snippet details()}
							<div class="flex items-center gap-2">
								<span class="text-muted-foreground">Rôle prévu :</span>
								<Badge class={selectedCandidate.role ? roleColors[selectedCandidate.role] : ''}>
									{VOLUNTEER_ROLE_OPTIONS.find((r) => r.value === selectedCandidate.role)?.label ??
										'—'}
								</Badge>
							</div>
						{/snippet}
					</CandidatePanel>
				{:else}
					<VolunteerPanel volunteer={selectedVolunteer} isAdmin={data.isAdmin} />
				{/if}
			{/snippet}
		</ListDetailLayout>
	</div>
</main>

<NewVolunteerDialog
	bind:open={newVolunteerOpen}
	onCancel={() => {
		newVolunteerOpen = false;
	}}
/>
