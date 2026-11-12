<script lang="ts">
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import { desktop } from '#lib/utils/media.svelte.ts';
	import StatCards from '#lib/components/cards/StatCards.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import { getAgeBadge } from '#lib/utils/age.ts';
	import NewCatDialog from '#lib/components/cats/NewCatDialog.svelte';
	import CatPanel from '#lib/components/cats/CatPanel.svelte';
	import CatRow from '#lib/components/cats/CatRow.svelte';
	import { CAT_AGE, CAT_SEX, CAT_STATUS } from '#lib/constants/cat.js';
	import { fade, fly } from 'svelte/transition';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import { getAdoptionTone } from '#lib/utils/adoption.ts';

	const { data } = $props();

	const cats = $derived(data.cats);

	let selectedCatId = $state<string | null>(null);
	const selectedCat = $derived(cats.find((c) => c.id === selectedCatId) ?? null);

	// Le chat sélectionné a disparu (supprimé) : on ferme le détail
	$effect(() => {
		if (selectedCatId && !selectedCat) {
			selectedCatId = null;
			mobilePanelOpen = false;
		}
	});

	const selectedCatName = $derived(
		selectedCat ? (selectedCat.name ?? selectedCat.catNumber) : 'Détail du chat'
	);

	let mobilePanelOpen = $state(false);
	let newCatOpen = $state(false);

	// ===== FILTRES (valeur '' = pas de filtre) =====
	let statusFilter = $state('');
	let sexFilter = $state('');
	let ageFilter = $state('');
	let searchQuery = $state('');

	// « À finaliser » n'est pas un statut de chat : une valeur à part, ajoutée aux statuts
	const ADOPTION_DUE = 'ADOPTION_DUE';
	const statusOptions = [...CAT_STATUS, { value: ADOPTION_DUE, label: 'Adoption à finaliser' }];

	// ===== PORTÉE : admin = interrupteur, autres = toujours « mes chats » =====
	let showAll = $state(false);
	const effectiveShowAll = $derived(data.isAdmin && showAll);
	const scopedCats = $derived(effectiveShowAll ? cats : cats.filter((c) => c.isMine));

	function resetView() {
		selectedCatId = null;
		sexFilter = '';
		ageFilter = '';
		searchQuery = '';
	}

	function clearFilters() {
		statusFilter = '';
		sexFilter = '';
		ageFilter = '';
		searchQuery = '';
	}

	function handleSelectCat(catId: string) {
		selectedCatId = catId;
		if (!desktop.current) mobilePanelOpen = true;
	}

	// ===== STATS : toujours cohérentes avec la portée =====
	const stats = $derived.by(() => {
		const yearStart = new Date(new Date().getFullYear(), 0, 1);

		return {
			managedByUser: cats.filter((c) => c.isMine).length,
			incompleteProfiles: scopedCats.filter((c) => !c.isOkCat || !c.isOkDog || !c.isOutside).length,
			visibleCats: scopedCats.filter((c) => c.isVisible).length,
			socializingCats: scopedCats.filter((c) => c.status === 'SOCIALIZE').length,
			adoptedThisYear: scopedCats.filter(
				(c) => c.status === 'ADOPTED' && new Date(c.updatedAt) >= yearStart
			).length
		};
	});

	const statCards = $derived([
		{
			label: effectiveShowAll ? 'Chats (tous)' : 'Chats sous ma gestion',
			value: effectiveShowAll ? scopedCats.length : stats.managedByUser,
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
		let filtered = scopedCats;

		if (statusFilter === ADOPTION_DUE) {
			filtered = filtered.filter((c) => getAdoptionTone(c) === 'DUE');
		} else if (statusFilter) {
			filtered = filtered.filter((c) => c.status === statusFilter);
		}
		if (sexFilter) filtered = filtered.filter((c) => c.sex === sexFilter);
		if (ageFilter) filtered = filtered.filter((c) => getAgeBadge(c.birthDate) === ageFilter);

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter(
				(c) =>
					(c.name ?? '').toLowerCase().includes(query) || c.catNumber.toLowerCase().includes(query)
			);
		}

		return filtered;
	});

	// Inclut le statut : sinon « Aucun chat » s'affichait alors qu'un filtre était actif
	const hasActiveFilters = $derived(
		statusFilter !== '' || !!sexFilter || !!ageFilter || !!searchQuery.trim()
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
							<div class="flex items-center gap-3">
								<Card.Title class="text-xl font-bold sm:text-2xl">
									{effectiveShowAll ? 'Tous les chats' : 'Mes chats'}
									<span class="text-base font-normal text-muted-foreground">
										({filteredCats.length})
									</span>
								</Card.Title>
								{#if data.isAdmin}
									<Switch
										id="scope-toggle"
										bind:checked={showAll}
										onCheckedChange={resetView}
										aria-label="Afficher tous les chats de l'association"
									/>
								{/if}
							</div>

							<Button class="rounded-2xl" size="sm" onclick={() => (newCatOpen = true)}>
								<Icon name="plus" class="h-4 w-4" />
								<span class="hidden sm:inline">Nouveau chat</span>
								<span class="sm:hidden">Ajouter</span>
							</Button>
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
									<SelectField
										id="cat-filter-status"
										label=""
										options={statusOptions}
										bind:value={statusFilter}
										placeholder="Statut"
										class="w-full sm:w-32"
									/>
									<SelectField
										id="cat-filter-sex"
										label=""
										options={CAT_SEX}
										bind:value={sexFilter}
										placeholder="Sexe"
										class="w-full sm:w-32"
									/>
									<SelectField
										id="cat-filter-age"
										label=""
										options={CAT_AGE}
										bind:value={ageFilter}
										placeholder="Âge"
										class="w-full sm:w-32"
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
											<Table.Head class="w-12 sm:w-16">Photo</Table.Head>
											<Table.Head class="hidden sm:table-cell">Num</Table.Head>
											<Table.Head>Nom</Table.Head>
											<Table.Head class="text-center">Sexe</Table.Head>
											<Table.Head>Âge</Table.Head>
											<Table.Head class="text-center sm:text-left">
												<span class="sm:hidden" title="Maladies">Mal.</span>
												<span class="hidden sm:inline">Maladie</span>
											</Table.Head>
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
					isAdmin={data.isAdmin}
				/>
			{/snippet}
		</ListDetailLayout>
	</div>
</main>

<NewCatDialog
	bind:open={newCatOpen}
	onCancel={() => {
		newCatOpen = false;
	}}
/>
