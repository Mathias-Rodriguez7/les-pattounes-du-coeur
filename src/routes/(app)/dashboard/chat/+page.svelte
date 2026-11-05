<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { getAgeBadge } from '$lib/utils/age';
	import NewCatDialog from '$lib/components/cats/NewCatDialog.svelte';
	import CatPanel from '$lib/components/cats/CatPanel.svelte';
	import CatRow from '$lib/components/cats/CatRow.svelte';
	import { CAT_AGE, CAT_SEX, CAT_STATUS } from '$lib/constants/cat.js';
	import { X, SlidersHorizontal } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';

	const { data } = $props();

	const cats = $derived(data.cats);

	// true à partir de 1024 px (valeur supposée côté serveur : ordinateur)
	const isDesktop = new MediaQuery('min-width: 1024px', true);

	let selectedCatId = $state<string | null>(null);
	const selectedCat = $derived(cats.find((c) => c.id === selectedCatId) ?? null);
	const selectedCatName = $derived(
		selectedCat ? (selectedCat.name ?? selectedCat.catNumber) : 'Détail du chat'
	);

	let mobilePanelOpen = $state(false);
	let newCatOpen = $state(false);

	// ===== FILTRES (valeur '' = pas de filtre) =====
	const DEFAULT_STATUS = 'SOCIALIZE';
	let statusFilter = $state(DEFAULT_STATUS);
	let sexFilter = $state('');
	let ageFilter = $state('');
	let searchQuery = $state('');

	// Mobile : filtres repliés par défaut
	let showFilters = $state(false);
	const activeFiltersCount = $derived([statusFilter, sexFilter, ageFilter].filter(Boolean).length);

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
		statusFilter = DEFAULT_STATUS;
		sexFilter = '';
		ageFilter = '';
		searchQuery = '';
	}

	function handleSelectCat(catId: string) {
		selectedCatId = catId;
		if (!isDesktop.current) mobilePanelOpen = true;
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

		if (statusFilter) filtered = filtered.filter((c) => c.status === statusFilter);
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
		statusFilter !== DEFAULT_STATUS || !!sexFilter || !!ageFilter || !!searchQuery.trim()
	);
</script>

<svelte:head>
	<title>Chats – Les Pattounes du Cœur</title>
</svelte:head>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<section class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
			{#each statCards as card, i (card.label)}
				<Card.Root class="gap-2 py-4 {i === 0 ? 'col-span-2 sm:col-span-1' : ''}">
					<Card.Header class="flex flex-row items-start justify-between gap-2 px-4">
						<Card.Title class="text-muted-foreground text-xs font-medium sm:text-sm">
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
						<div class="flex items-center gap-3">
							<Card.Title class="text-xl font-bold sm:text-2xl">
								{effectiveShowAll ? 'Tous les chats' : 'Mes chats'}
								<span class="text-muted-foreground text-base font-normal">
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
						<div class="flex gap-2">
							<div class="relative flex-1">
								<Icon
									name="search"
									class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
								/>
								<Input
									type="search"
									placeholder="Nom ou numéro…"
									aria-label="Chercher un chat par nom ou numéro"
									bind:value={searchQuery}
									class="pl-9"
								/>
							</div>
							<Button
								variant="outline"
								size="sm"
								class="h-9 shrink-0 sm:hidden"
								onclick={() => (showFilters = !showFilters)}
								aria-expanded={showFilters}
								aria-controls="cat-filters"
							>
								<SlidersHorizontal class="size-4" />
								Filtres
								{#if activeFiltersCount > 0}
									<span
										class="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs"
									>
										{activeFiltersCount}
									</span>
								{/if}
							</Button>
						</div>

						<!-- Filtres : repliables sur mobile, toujours visibles à partir de 640 px -->
						<div
							id="cat-filters"
							class="{showFilters
								? 'grid'
								: 'hidden'} grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
						>
							<SelectField
								id="cat-filter-status"
								label=""
								options={CAT_STATUS}
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
							<Button class="rounded-2xl" size="sm" variant="outline" onclick={clearFilters}>
								Réinitialiser
							</Button>
						</div>

						<!-- Tableau -->
						<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
							<Table.Root containerClass="overflow-visible">
								<Table.Header
									class="bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]"
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

			<!-- DÉTAIL : ordinateur -->
			{#if isDesktop.current}
				<div class="min-w-0 lg:col-span-3">
					<CatPanel
						cat={selectedCat}
						hosts={data.hosts}
						volunteers={data.volunteers}
						isAdmin={data.isAdmin}
					/>
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
			<header class="bg-card/95 sticky top-0 z-10 flex items-center gap-2 px-4 py-2 backdrop-blur">
				<Sheet.Title class="min-w-0 flex-1 truncate text-base font-semibold">
					{selectedCatName}
				</Sheet.Title>
				<Sheet.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Fermer et revenir à la liste"
				>
					<X class="size-5" />
				</Sheet.Close>
			</header>

			<div class="p-3">
				<CatPanel
					cat={selectedCat}
					hosts={data.hosts}
					volunteers={data.volunteers}
					isAdmin={data.isAdmin}
				/>
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}

<NewCatDialog
	bind:open={newCatOpen}
	onCancel={() => {
		newCatOpen = false;
	}}
/>
