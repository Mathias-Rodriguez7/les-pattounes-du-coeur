<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import StatCards from '#lib/components/cards/StatCards.svelte';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { ChevronRight } from '@lucide/svelte';
	import SosPanel from '#lib/components/sos/SosPanel.svelte';
	import SosCreateDialog from '#lib/components/sos/SosCreateDialog.svelte';
	import NewCatDialog from '#lib/components/cats/NewCatDialog.svelte';
	import NewCatKindDialog from '#lib/components/cats/free/NewCatKindDialog.svelte';
	import NewFreeCatDialog from '#lib/components/cats/free/NewFreeCatDialog.svelte';
	import {
		SOS_CATEGORY,
		SOS_CATEGORY_OPTIONS,
		SOS_STATUS,
		SOS_STATUS_ORDER
	} from '#lib/constants/sos.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import { formatAddress } from '#lib/utils/geo.ts';
	import { desktop } from '#lib/utils/media.svelte.ts';
	import {
		linkedId,
		rememberSelection,
		scrollToRow,
		takeNewParam
	} from '#lib/navigation/entityLink.ts';
	import { afterNavigate } from '$app/navigation';
	import type { SosView } from '#lib/server/sos/queries.ts';

	let { data } = $props();

	// « + SOS » depuis le dashboard (?nouveau=1) : le formulaire s'ouvre tout de suite
	let newSosOpen = $state(false);
	afterNavigate(() => {
		if (takeNewParam()) newSosOpen = true;
	});

	const sosList = $derived(data.sosList);

	// ===== FILTRES (valeur '' = pas de filtre) : « À traiter » par défaut =====
	const STATUS_OPTIONS = SOS_STATUS_ORDER.map((value) => ({
		value,
		label: SOS_STATUS[value].label
	}));
	const HANDLER_OPTIONS = [
		{ value: 'ME', label: 'Par moi' },
		{ value: 'NONE', label: 'Par personne' }
	];

	let statusFilter = $state('NEW');
	let categoryFilter = $state('');
	let handlerFilter = $state('');
	let searchQuery = $state('');

	function clearFilters() {
		statusFilter = 'NEW';
		categoryFilter = '';
		handlerFilter = '';
		searchQuery = '';
	}

	/** « Pérols » → « perols » : la recherche ignore les majuscules et les accents */
	const normalize = (text: string) =>
		text
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase();

	const filtered = $derived.by(() => {
		const q = normalize(searchQuery.trim());
		return sosList.filter((sos) => {
			if (statusFilter && sos.status !== statusFilter) return false;
			if (categoryFilter && sos.category !== categoryFilter) return false;
			// « Mes SOS » : ceux que je traite, ou où je suis en renfort
			if (
				handlerFilter === 'ME' &&
				sos.handledById !== data.userId &&
				!sos.helperIds.includes(data.userId)
			)
				return false;
			if (handlerFilter === 'NONE' && sos.handledById !== null) return false;
			if (!q) return true;
			return normalize(
				[
					sos.reporterFirstName,
					sos.reporterLastName,
					formatAddress(sos),
					sos.handledByName,
					...sos.helpers.map((helper) => helper.name)
				]
					.filter(Boolean)
					.join(' ')
			).includes(q);
		});
	});

	// ===== STATS =====
	const yearStart = new Date(new Date().getFullYear(), 0, 1);
	const statCards = $derived([
		{
			label: 'À traiter',
			value: sosList.filter((s) => s.status === 'NEW').length,
			icon: 'alert',
			theme: 'dog'
		},
		{
			label: 'En cours',
			value: sosList.filter((s) => s.status === 'IN_PROGRESS').length,
			icon: 'clock',
			theme: 'pending'
		},
		{
			label: 'Clôturés cette année',
			value: sosList.filter(
				(s) => s.status === 'CLOSED' && s.closedAt && new Date(s.closedAt) >= yearStart
			).length,
			icon: 'CircleCheck',
			theme: 'activ'
		},
		{
			label: 'Chats pris en charge cette année',
			value: sosList
				.filter((s) => new Date(s.reportedAt) >= yearStart)
				.reduce((sum, s) => sum + s.cats.length, 0),
			icon: 'cat',
			theme: 'cats'
		}
	]);

	// ===== SÉLECTION (comme les pages Chats, FA, Bénévoles) =====
	let selectedId = $state<string | null>(null);
	const selected = $derived(sosList.find((sos) => sos.id === selectedId) ?? null);
	let mobilePanelOpen = $state(false);

	function select(id: string) {
		selectedId = id;
		if (!desktop.current) mobilePanelOpen = true;
	}

	function handleSelect(id: string) {
		select(id);
		rememberSelection(id);
	}

	// Arrivée par un lien (?id=…), ex : « Voir le SOS » depuis la fiche d'un chat
	$effect(() => {
		const id = linkedId();
		if (id && id !== untrack(() => selectedId)) untrack(() => openFromLink(id));
	});

	function openFromLink(id: string) {
		const sos = sosList.find((s) => s.id === id);
		if (!sos) {
			toast.error("Ce SOS n'existe plus.");
			return;
		}
		// Caché par un filtre : on montre son statut, sans les autres filtres
		if (!filtered.some((s) => s.id === id)) {
			clearFilters();
			statusFilter = sos.status;
		}
		select(id);
		scrollToRow(id);
	}

	// Un SOS saisi à la main : il est « en cours », à son nom
	function openCreated(id: string) {
		clearFilters();
		statusFilter = 'IN_PROGRESS';
		handleSelect(id);
	}

	// ===== « Créer un chat » depuis le SOS choisi =====
	let newCatOpen = $state(false);
	// D'abord le type : chat asso (le formulaire habituel) ou chat libre
	let newCatKindOpen = $state(false);
	let newFreeCatOpen = $state(false);
	let newCatSos = $state<SosView | null>(null);
	const newCatOrigin = $derived.by(() => {
		const place = newCatSos ? formatAddress(newCatSos) : null;
		return place ? `SOS · ${place}` : 'SOS';
	});

	function createCat(sos: SosView) {
		newCatSos = sos;
		newCatKindOpen = true;
	}

	const panelTitle = $derived(
		selected ? `SOS · ${selected.reporterFirstName} ${selected.reporterLastName}` : 'Détail du SOS'
	);
</script>

<svelte:head>
	<title>SOS – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<!-- Le titre de la page, pour les lecteurs d'écran et les moteurs de recherche -->
	<h1 class="sr-only">SOS</h1>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<StatCards cards={statCards} class="grid-cols-2 xl:grid-cols-4" featureFirst />

		<!-- ================= LISTE + DÉTAIL ================= -->
		<ListDetailLayout bind:open={mobilePanelOpen} title={panelTitle}>
			{#snippet list()}
				<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-14rem)]">
					<Card.Root class="flex flex-col lg:absolute lg:inset-0">
						<Card.Header
							class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2"
						>
							<Card.Title class="text-xl font-bold sm:text-2xl">
								SOS
								<span class="text-base font-normal text-muted-foreground">({filtered.length})</span>
							</Card.Title>
							<SosCreateDialog bind:open={newSosOpen} onCreated={openCreated} />
						</Card.Header>

						<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
							<TableToolbar
								bind:search={searchQuery}
								searchPlaceholder="Chercher un SOS…"
								searchLabel="Chercher un SOS par nom, lieu ou bénévole"
								onReset={clearFilters}
							>
								{#snippet filters()}
									<SelectField
										id="sos-filter-status"
										label=""
										options={STATUS_OPTIONS}
										bind:value={statusFilter}
										placeholder="Statut"
										class="w-full sm:w-44"
									/>
									<SelectField
										id="sos-filter-category"
										label=""
										options={SOS_CATEGORY_OPTIONS}
										bind:value={categoryFilter}
										placeholder="Catégorie"
										class="w-full sm:w-48"
									/>
									<SelectField
										id="sos-filter-handler"
										label=""
										options={HANDLER_OPTIONS}
										bind:value={handlerFilter}
										placeholder="Pris en charge"
										class="w-full sm:w-48"
									/>
								{/snippet}
							</TableToolbar>

							<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
								<Table.Root containerClass="overflow-visible">
									<Table.Header
										class="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_var(--border)]"
									>
										<Table.Row>
											<Table.Head>Date</Table.Head>
											<Table.Head>Signalé par</Table.Head>
											<Table.Head class="hidden md:table-cell">Catégorie</Table.Head>
											<Table.Head>Statut</Table.Head>
											<Table.Head class="w-8 sm:hidden"
												><span class="sr-only">Ouvrir</span></Table.Head
											>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each filtered as sos (sos.id)}
											<Table.Row
												data-row-id={sos.id}
												onclick={() => handleSelect(sos.id)}
												class="{selectedId === sos.id
													? 'bg-accent hover:bg-accent'
													: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
											>
												<Table.Cell class="text-sm">{formatDateNum(sos.reportedAt)}</Table.Cell>
												<Table.Cell class="max-w-40">
													<p class="truncate font-semibold text-gray-900">
														{sos.reporterFirstName}
														{sos.reporterLastName}
													</p>
													{#if sos.handledByName}
														<p class="truncate text-xs text-muted-foreground">
															{sos.handledByName}{sos.helpers.length > 0
																? ` + ${sos.helpers.length}`
																: ''}
														</p>
													{/if}
												</Table.Cell>

												<Table.Cell class="hidden md:table-cell">
													{#if sos.category}
														<Badge class={SOS_CATEGORY[sos.category].color}>
															{SOS_CATEGORY[sos.category].label}
														</Badge>
													{:else}
														<span class="text-xs text-muted-foreground">—</span>
													{/if}
												</Table.Cell>
												<Table.Cell>
													<Badge class={SOS_STATUS[sos.status].color}>
														{SOS_STATUS[sos.status].label}
													</Badge>
												</Table.Cell>
												<Table.Cell class="w-8 text-muted-foreground sm:hidden">
													<ChevronRight class="size-4" />
												</Table.Cell>
											</Table.Row>
										{:else}
											<Table.Row>
												<Table.Cell colspan={6} class="text-muted-foreground py-10 text-center">
													{statusFilter === 'NEW' && !searchQuery
														? 'Aucun SOS à traiter 🎉'
														: 'Aucun SOS ne correspond à ces filtres.'}
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
				<SosPanel
					sos={selected}
					isAdmin={data.isAdmin}
					volunteers={data.volunteers}
					onCreateCat={createCat}
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

<NewCatDialog bind:open={newCatOpen} sosId={newCatSos?.id ?? null} initialOrigin={newCatOrigin} />

<!-- Chat libre : le relâchage part du lieu du SOS ; une bénévole se choisit elle-même -->
<NewFreeCatDialog
	bind:open={newFreeCatOpen}
	volunteers={data.volunteers}
	veterinarians={data.veterinarians}
	isAdmin={data.isAdmin}
	sosId={newCatSos?.id ?? null}
	initialPlace={newCatSos}
/>
