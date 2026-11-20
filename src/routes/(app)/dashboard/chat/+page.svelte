<script lang="ts">
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import { desktop } from '#lib/utils/media.svelte.ts';
	import StatCards from '#lib/components/cards/StatCards.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import SegmentedTabs from '#lib/components/tabs/SegmentedTabs.svelte';
	import { Megaphone, Send, UserRound, Users } from '@lucide/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { getAgeBadge } from '#lib/utils/age.ts';
	import NewCatDialog from '#lib/components/cats/NewCatDialog.svelte';
	import NewCatKindDialog from '#lib/components/cats/free/NewCatKindDialog.svelte';
	import NewFreeCatDialog from '#lib/components/cats/free/NewFreeCatDialog.svelte';
	import { catDisplayName } from '#lib/utils/catHelpers.ts';
	import {
		canPublishCats,
		PUBLICATION_STATE,
		publicationState
	} from '#lib/permissions/publication.ts';
	import CatPanel from '#lib/components/cats/CatPanel.svelte';
	import CatRow from '#lib/components/cats/CatRow.svelte';
	import { ASSO_CAT_STATUS, CAT_AGE, CAT_SEX } from '#lib/constants/cat.js';
	import { fade, fly } from 'svelte/transition';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import { getAdoptionTone } from '#lib/utils/adoption.ts';
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

	const cats = $derived(data.cats);

	let selectedCatId = $state<string | null>(null);
	const selectedCat = $derived(cats.find((c) => c.id === selectedCatId) ?? null);

	// Le chat sélectionné a disparu (supprimé) : on ferme le détail
	$effect(() => {
		if (selectedCatId && !selectedCat) {
			selectedCatId = null;
			mobilePanelOpen = false;
			rememberSelection(null);
		}
	});

	const selectedCatName = $derived(selectedCat ? catDisplayName(selectedCat) : 'Détail du chat');

	let mobilePanelOpen = $state(false);
	let newCatOpen = $state(false);
	// « Nouveau chat » demande d'abord le type : chat asso ou chat libre
	let newCatKindOpen = $state(false);

	// « Créer » depuis le dashboard (?nouveau=1) : le formulaire s'ouvre tout de suite
	afterNavigate(() => {
		if (takeNewParam()) newCatKindOpen = true;
	});
	let newFreeCatOpen = $state(false);

	// ===== TYPE : chats asso (par défaut) ou chats libres =====
	// Les chats libres ne se mélangent pas aux autres : leur fiche, leurs infos sont différentes
	type CatKind = 'ASSO' | 'FREE';
	let kindFilter = $state<string>('ASSO');
	const KIND_OPTIONS = [
		{ value: 'ASSO', label: 'Chats asso' },
		{ value: 'FREE', label: 'Chats libres' }
	];
	const kindOf = (cat: { status: string }): CatKind => (cat.status === 'FREE' ? 'FREE' : 'ASSO');

	// ===== FILTRES (valeur '' = pas de filtre) =====
	let statusFilter = $state('');
	let sexFilter = $state('');
	let ageFilter = $state('');
	let searchQuery = $state('');
	// Admin, sur « Tous les chats » : avec ou sans bénévole associée
	let volunteerFilter = $state('');
	const VOLUNTEER_FILTER_OPTIONS = [
		{ value: 'WITH', label: 'Avec bénévole' },
		{ value: 'NONE', label: 'Sans bénévole' }
	];

	// « À finaliser » n'est pas un statut de chat : une valeur à part, ajoutée aux statuts
	const ADOPTION_DUE = 'ADOPTION_DUE';
	// « Publication à valider » : les chats proposés à l'adoption (admin, communication)
	const PUBLICATION_DUE = 'PUBLICATION_DUE';
	const statusOptions = $derived([
		...ASSO_CAT_STATUS,
		{ value: ADOPTION_DUE, label: 'Adoption à finaliser' },
		...(canPublishCats(data.user?.role)
			? [{ value: PUBLICATION_DUE, label: 'Publication à valider' }]
			: [])
	]);

	// ===== PORTÉE : les onglets en haut de la liste =====
	// Admin : « Mes chats » / « Tous » / « Publication » ; manager : « Mes chats » / « Publication »
	// (où en sont ses demandes : refusées, en attente, publiées ; l'admin peut afficher celles des
	// autres bénévoles avec les filtres) ; communication : « Mes chats » / « À publier »
	type View = 'MINE' | 'ALL' | 'PUBLISH' | 'PUBLICATION';
	let view = $state<View>('MINE');
	const isCommunication = $derived(data.user?.role === 'COMMUNICATION');
	const isManager = $derived(data.user?.role === 'MANAGER');
	const effectiveShowAll = $derived(data.isAdmin && view === 'ALL');
	const showPublish = $derived(isCommunication && view === 'PUBLISH');
	const showPublication = $derived((isManager || data.isAdmin) && view === 'PUBLICATION');

	// Filtres de l'onglet « Publication » : l'état, et (admin) les chats des autres bénévoles
	let pubStateFilter = $state('');
	const PUB_STATE_OPTIONS = (['REFUSED', 'PENDING', 'PUBLISHED'] as const).map((value) => ({
		value,
		label: PUBLICATION_STATE[value].label
	}));
	let pubOwnerFilter = $state('');
	const PUB_OWNER_OPTIONS = [{ value: 'ALL', label: 'Toutes les bénévoles' }];

	// Le plus ancien d'abord : il attend depuis le plus longtemps
	const toPublish = $derived(
		cats
			.filter((c) => !!c.publicationRequestedAt)
			.sort(
				(a, b) =>
					new Date(a.publicationRequestedAt!).getTime() -
					new Date(b.publicationRequestedAt!).getTime()
			)
	);

	// Les demandes de publication : refusées d'abord (à reprendre), puis en attente (la plus
	// ancienne d'abord), puis publiées. Ses chats, ou ceux de toutes (admin, avec le filtre)
	const requestedTime = (c: (typeof cats)[number]) =>
		c.publicationRequestedAt ? new Date(c.publicationRequestedAt).getTime() : 0;
	const publications = $derived(
		cats
			.filter(
				(c) => publicationState(c) && (c.isMine || (data.isAdmin && pubOwnerFilter === 'ALL'))
			)
			.sort(
				(a, b) =>
					PUBLICATION_STATE[publicationState(a)!].rank -
						PUBLICATION_STATE[publicationState(b)!].rank || requestedTime(a) - requestedTime(b)
			)
	);
	const refusedCount = $derived(
		cats.filter((c) => c.isMine && publicationState(c) === 'REFUSED').length
	);

	const scopedCats = $derived(
		showPublish
			? toPublish
			: showPublication
				? publications
				: effectiveShowAll
					? cats
					: cats.filter((c) => c.isMine)
	);
	// Les statistiques ne parlent que des chats asso
	const scopedAssoCats = $derived(scopedCats.filter((c) => kindOf(c) === 'ASSO'));

	function resetView() {
		selectedCatId = null;
		rememberSelection(null);
		sexFilter = '';
		ageFilter = '';
		searchQuery = '';
		volunteerFilter = '';
		pubStateFilter = '';
		pubOwnerFilter = '';
	}

	function clearFilters() {
		kindFilter = 'ASSO';
		statusFilter = '';
		sexFilter = '';
		ageFilter = '';
		searchQuery = '';
		volunteerFilter = '';
		pubStateFilter = '';
		pubOwnerFilter = '';
	}

	function selectCat(catId: string) {
		selectedCatId = catId;
		if (!desktop.current) mobilePanelOpen = true;
	}

	// Clic sur une ligne : on garde aussi son id dans l'adresse (le bouton « Retour » la rouvrira)
	function handleSelectCat(catId: string) {
		selectCat(catId);
		rememberSelection(catId);
	}

	// Arrivée par un nom cliquable (?id=…) : on ouvre son panneau
	$effect(() => {
		const id = linkedId();
		if (id && id !== untrack(() => selectedCatId)) untrack(() => openFromLink(id));
	});

	function openFromLink(id: string) {
		const cat = cats.find((c) => c.id === id);
		// Une bénévole ne charge que SES chats : un autre chat n'est pas dans sa liste
		if (!cat) {
			toast.error(
				data.isAdmin ? "Ce chat n'existe plus." : 'Ce chat ne fait pas partie de vos chats.'
			);
			return;
		}
		// L'admin est sur « Mes chats » et ce chat n'en fait pas partie : on passe sur « Tous »
		if (data.isAdmin && !cat.isMine) view = 'ALL';
		// Une COMMUNICATION, sur un chat proposé qui n'est pas le sien : « À publier »
		else if (isCommunication && !cat.isMine && cat.publicationRequestedAt) view = 'PUBLISH';
		// Sur « À publier » / « Publication », un chat qui n'y est pas : retour sur « Mes chats »
		else if (view !== 'ALL' && !scopedCats.some((c) => c.id === id)) view = 'MINE';
		if (!filteredCats.some((c) => c.id === id)) clearFilters();
		// Un chat libre : on passe sur « Chats libres »
		kindFilter = kindOf(cat);
		selectCat(id);
		scrollToRow(id);
	}

	// ===== STATS : toujours cohérentes avec la portée =====
	const stats = $derived.by(() => {
		const yearStart = new Date(new Date().getFullYear(), 0, 1);

		return {
			managedByUser: cats.filter((c) => c.isMine && kindOf(c) === 'ASSO').length,
			incompleteProfiles: scopedAssoCats.filter((c) => !c.isOkCat || !c.isOkDog || !c.isOutside)
				.length,
			visibleCats: scopedAssoCats.filter((c) => c.isVisible).length,
			socializingCats: scopedAssoCats.filter((c) => c.status === 'SOCIALIZE').length,
			adoptedThisYear: scopedAssoCats.filter(
				(c) => c.status === 'ADOPTED' && new Date(c.updatedAt) >= yearStart
			).length
		};
	});

	const statCards = $derived([
		{
			label: effectiveShowAll ? 'Chats (tous)' : 'Chats sous ma gestion',
			value: effectiveShowAll ? scopedAssoCats.length : stats.managedByUser,
			icon: 'cat',
			theme: 'cats'
		},
		{ label: 'Profils incomplets', value: stats.incompleteProfiles, icon: 'alert', theme: 'dog' },
		{ label: 'Chats visibles', value: stats.visibleCats, icon: 'Eye', theme: 'fa' },
		{
			label: 'En socialisation',
			value: stats.socializingCats,
			icon: 'heart',
			theme: 'socializing'
		},
		{
			label: 'Adoptés cette année',
			value: stats.adoptedThisYear,
			icon: 'heart',
			theme: 'adoptions'
		}
	]);

	// ===== FILTRAGE : portée → statut → sexe → âge → recherche =====
	const filteredCats = $derived.by(() => {
		let filtered = scopedCats.filter((c) => kindOf(c) === kindFilter);

		// Onglet « Publication » : on filtre sur l'état de la demande, pas sur le statut
		if (showPublication) {
			if (pubStateFilter) filtered = filtered.filter((c) => publicationState(c) === pubStateFilter);
		}
		// Le statut n'a de sens que pour les chats asso (un chat libre est toujours « Libre »)
		else if (kindFilter === 'ASSO' && statusFilter === ADOPTION_DUE) {
			filtered = filtered.filter((c) => getAdoptionTone(c) === 'DUE');
		} else if (kindFilter === 'ASSO' && statusFilter === PUBLICATION_DUE) {
			filtered = filtered.filter((c) => !!c.publicationRequestedAt);
		} else if (kindFilter === 'ASSO' && statusFilter) {
			filtered = filtered.filter((c) => c.status === statusFilter);
		}
		if (sexFilter) filtered = filtered.filter((c) => c.sex === sexFilter);
		if (ageFilter) filtered = filtered.filter((c) => getAgeBadge(c.birthDate) === ageFilter);
		// Seulement sur « Tous les chats » : sur « Mes chats », ils ont tous une bénévole (moi)
		if (effectiveShowAll && volunteerFilter) {
			const wanted = volunteerFilter === 'WITH';
			filtered = filtered.filter((c) => c.volunteers.length > 0 === wanted);
		}

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter(
				(c) =>
					(c.name ?? '').toLowerCase().includes(query) ||
					(c.catNumber ?? '').toLowerCase().includes(query) ||
					// Un chat libre se retrouve aussi par la ville de son relâchage
					(c.freeInfo?.city ?? '').toLowerCase().includes(query)
			);
		}

		return filtered;
	});

	// Inclut le statut : sinon « Aucun chat » s'affichait alors qu'un filtre était actif
	const hasActiveFilters = $derived(
		kindFilter !== 'ASSO' ||
			(!showPublication && statusFilter !== '') ||
			(showPublication && (!!pubStateFilter || !!pubOwnerFilter)) ||
			!!sexFilter ||
			!!ageFilter ||
			!!searchQuery.trim() ||
			(effectiveShowAll && !!volunteerFilter)
	);

	// « + Nouveau chat » fait ~140 px : s'il ne tient plus à côté des onglets, on garde le « + »
	// (mesuré, car la place dépend du nombre d'onglets et de leurs nombres)
	const NEW_BUTTON_FULL_WIDTH = 150;
	let headerWidth = $state(0);
	let tabsWidth = $state(0);
	const compactNewButton = $derived(
		headerWidth > 0 && headerWidth - tabsWidth < NEW_BUTTON_FULL_WIDTH
	);

	// ===== ONGLETS : ils servent aussi de titre (le nombre remplace « Mes chats (4) ») =====
	// L'onglet ouvert compte la liste filtrée ; l'autre, tout ce qu'il contient
	const kindCount = (list: typeof cats) => list.filter((c) => kindOf(c) === kindFilter).length;
	const countFor = (key: View, total: number) => (view === key ? filteredCats.length : total);
	const libres = $derived(kindFilter === 'FREE' ? ' libres' : '');
	const mineTab = $derived({
		key: 'MINE' as View,
		label: `Mes chats${libres}`,
		icon: UserRound,
		count: countFor('MINE', kindCount(cats.filter((c) => c.isMine)))
	});
	// Communication : les chats proposés à l'adoption, à publier ou refuser
	const publishTab = $derived({
		key: 'PUBLISH' as View,
		label: 'À publier',
		icon: Megaphone,
		count: countFor('PUBLISH', toPublish.length),
		countClass: 'bg-sky-100 text-sky-800'
	});
	// Admin et manager : où en sont les demandes. La pastille montre ce qui demande d'agir :
	// les demandes à valider (admin), ses demandes refusées (manager)
	const publicationTab = $derived({
		key: 'PUBLICATION' as View,
		label: 'Publication',
		icon: Send,
		count: data.isAdmin ? toPublish.length : refusedCount,
		countClass: data.isAdmin ? 'bg-sky-100 text-sky-800' : PUBLICATION_STATE.REFUSED.badgeClass
	});
	const tabs = $derived(
		data.isAdmin
			? [
					mineTab,
					{
						key: 'ALL' as View,
						label: kindFilter === 'FREE' ? 'Tous les libres' : 'Tous',
						icon: Users,
						count: countFor('ALL', kindCount(cats))
					},
					publicationTab
				]
			: isCommunication
				? [mineTab, publishTab]
				: [mineTab, publicationTab]
	);
</script>

<svelte:head>
	<title>Chats – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<StatCards cards={statCards} class="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5" featureFirst />

		<!-- ================= LISTE + DÉTAIL ================= -->
		<ListDetailLayout bind:open={mobilePanelOpen} title={selectedCatName}>
			{#snippet list()}
				<!-- LISTE : sur PC, sa hauteur suit celle du panneau -->
				<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-14rem)]">
					<Card.Root class="flex flex-col lg:absolute lg:inset-0">
						<Card.Header
							class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2"
						>
							<!-- Les onglets font office de titre ; le titre reste pour les lecteurs d'écran -->
							<Card.Title class="sr-only" role="heading" aria-level={1}>Chats</Card.Title>
							<div
								class="flex w-full items-center justify-between gap-2"
								bind:clientWidth={headerWidth}
							>
								<div class="min-w-0 overflow-x-auto" bind:clientWidth={tabsWidth}>
									<SegmentedTabs
										label="Chats affichés"
										bind:value={view}
										onChange={(key) => {
											// « À publier » et « Publication » ne concernent que les chats asso
											if (key === 'PUBLISH' || key === 'PUBLICATION') kindFilter = 'ASSO';
											resetView();
										}}
										{tabs}
									/>
								</div>

								<!-- Pas la place à côté des onglets : le bouton devient un simple « + » -->
								<Button
									class="rounded-2xl"
									size="sm"
									aria-label="Nouveau chat"
									title="Nouveau chat"
									onclick={() => (newCatKindOpen = true)}
								>
									<Icon name="plus" class="h-4 w-4" />
									{#if !compactNewButton}<span>Nouveau chat</span>{/if}
								</Button>
							</div>
						</Card.Header>

						<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
							<!-- Recherche + bouton Filtres (mobile) -->
							<TableToolbar
								bind:search={searchQuery}
								searchPlaceholder="Nom ou numéro…"
								searchLabel="Chercher un chat par nom ou numéro"
								onReset={clearFilters}
							>
								{#snippet filters()}
									{#if showPublication}
										<SelectField
											id="cat-filter-pub-state"
											label=""
											options={PUB_STATE_OPTIONS}
											bind:value={pubStateFilter}
											placeholder="État"
											class="w-full sm:w-44"
										/>
										<!-- Admin : afficher aussi les chats des autres (ex : valider leurs demandes) -->
										{#if data.isAdmin}
											<SelectField
												id="cat-filter-pub-owner"
												label=""
												options={PUB_OWNER_OPTIONS}
												bind:value={pubOwnerFilter}
												placeholder="Mes chats"
												ariaLabel="Chats"
												class="w-full sm:w-44"
											/>
										{/if}
									{:else}
										<SelectField
											id="cat-filter-kind"
											label=""
											ariaLabel="Type de chat"
											showName={false}
											options={KIND_OPTIONS}
											bind:value={kindFilter}
											class="w-full sm:w-36"
										/>
										{#if kindFilter === 'ASSO'}
											<SelectField
												id="cat-filter-status"
												label=""
												options={statusOptions}
												bind:value={statusFilter}
												placeholder="Statut"
												class="w-full sm:w-44"
											/>
										{/if}
									{/if}
									<SelectField
										id="cat-filter-sex"
										label=""
										options={CAT_SEX}
										bind:value={sexFilter}
										placeholder="Sexe"
										class="w-full sm:w-44"
									/>
									<SelectField
										id="cat-filter-age"
										label=""
										options={CAT_AGE}
										bind:value={ageFilter}
										placeholder="Âge"
										class="w-full sm:w-44"
									/>
									<!-- Admin sur « Tous les chats » : retrouver les chats que personne ne suit -->
									{#if effectiveShowAll}
										<SelectField
											id="cat-filter-volunteer"
											label=""
											options={VOLUNTEER_FILTER_OPTIONS}
											bind:value={volunteerFilter}
											placeholder="Bénévole"
											class="w-full sm:w-48"
										/>
									{/if}
								{/snippet}
							</TableToolbar>

							<!-- Tableau -->
							<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
								<Table.Root containerClass="overflow-visible">
									<Table.Header
										class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
									>
										<Table.Row>
											<Table.Head class="w-12 sm:w-16">Photo</Table.Head>
											<Table.Head>Nom</Table.Head>
											<Table.Head class="text-center">Sexe</Table.Head>
											<Table.Head>Âge</Table.Head>
											<Table.Head class="text-center sm:text-left">
												<span class="sm:hidden" title="Maladies">Mal.</span>
												<span class="hidden sm:inline">Maladie</span>
											</Table.Head>
											<Table.Head class="hidden md:table-cell">Bénévole</Table.Head>
											<Table.Head class="w-6 px-0 sm:hidden"
												><span class="sr-only">Ouvrir</span></Table.Head
											>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each filteredCats as cat (cat.id)}
											<CatRow
												{cat}
												onclick={() => handleSelectCat(cat.id)}
												isSelected={selectedCatId === cat.id}
												publication={showPublication ? publicationState(cat) : null}
											/>
										{:else}
											<Table.Row>
												<Table.Cell colspan={7} class="text-muted-foreground py-10 text-center">
													{#if searchQuery.trim()}
														Aucun chat trouvé pour « {searchQuery.trim()} »
													{:else if hasActiveFilters}
														Aucun chat ne correspond à ces filtres.
													{:else}
														Aucun chat pour le moment.
													{/if}
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/snippet}

			{#snippet detail()}
				<CatPanel
					cat={selectedCat}
					hosts={data.hosts}
					volunteers={data.volunteers}
					veterinarians={data.veterinarians}
					linkableSos={data.linkableSos}
					isAdmin={data.isAdmin}
				/>
			{/snippet}
		</ListDetailLayout>
	</div>
</main>

<NewCatKindDialog
	bind:open={newCatKindOpen}
	onChoose={(kind) => {
		if (kind === 'ASSO') newCatOpen = true;
		else newFreeCatOpen = true;
	}}
/>

<NewFreeCatDialog
	bind:open={newFreeCatOpen}
	volunteers={data.volunteers.map((v) => ({
		id: v.id,
		name: `${v.profil.firstName} ${v.profil.lastName}`
	}))}
	veterinarians={data.veterinarians}
	isAdmin={data.isAdmin}
	onCreated={(catId) => {
		kindFilter = 'FREE';
		handleSelectCat(catId);
		scrollToRow(catId);
	}}
/>

<NewCatDialog
	bind:open={newCatOpen}
	onCancel={() => {
		newCatOpen = false;
	}}
/>
