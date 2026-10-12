<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { getAgeBadge } from '$lib/utils/age';
	import NewCatDialog from '$lib/components/cats/NewCatDialog.svelte';
	import CatPanel from '$lib/components/cats/CatPanel.svelte';
	import CatRow from '$lib/components/cats/CatRow.svelte';
	import { CAT_AGE, CAT_SEX, CAT_STATUS } from '$lib/constants/cat.js';

	const { data } = $props();

	let cats = $derived(data.cats);

	let selectedCatId = $state<string | null>(null);
	let selectedCat = $derived(cats.find((c) => c.id === selectedCatId) ?? null);

	let newCatOpen = $state(false);
	let searchQuery = $state('');

	// ==========================================
	// Filtres Select (valeur '' = pas de filtre)
	// ==========================================
	let statusFilter = $state('SOCIALIZE');
	let sexFilter = $state('');
	let ageFilter = $state('');

	// ==========================================
	// Portée : admin = switch, autres = toujours "mes chats"
	// ==========================================
	let showAll = $state(false);
	const effectiveShowAll = $derived(data.isAdmin && showAll);

	const scopedCats = $derived(effectiveShowAll ? cats : cats.filter((c) => c.isMine));

	function resetView() {
		selectedCatId = null;
		sexFilter = '';
		ageFilter = '';
		searchQuery = '';
	}

	// ==========================================
	// Stats : toujours cohérentes avec la portée
	// ==========================================
	const stats = $derived.by(() => {
		const yearStart = new Date(new Date().getFullYear(), 0, 1);

		return {
			managedByUser: cats.filter((c) => c.isMine).length,
			incompleteProfiles: scopedCats.filter((c) => !c.isOkCat || !c.isOkDog || !c.isOutside).length,
			visibleCats: scopedCats.filter((c) => c.isVisible).length,
			socializingCats: scopedCats.filter((c) => c.status === 'SOCIALIZE').length,
			adoptedThisYear: scopedCats.filter(
				(c) => c.status === 'ADOPTED' && new Date(c.updated_at) >= yearStart
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
		{
			label: 'Profils de chat incomplets',
			value: stats.incompleteProfiles,
			icon: 'alert',
			theme: 'dog'
		},
		{
			label: 'Chats visibles',
			value: stats.visibleCats,
			icon: 'Eye',
			theme: 'fa'
		},
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

	// ==========================================
	// Filtres : portée → sexe → âge → recherche
	// ==========================================
	const filteredCats = $derived.by(() => {
		let filtered = scopedCats;

		if (statusFilter) {
			filtered = filtered.filter((c) => c.status === statusFilter);
		}

		if (sexFilter) {
			filtered = filtered.filter((c) => c.sex === sexFilter);
		}

		if (ageFilter) {
			filtered = filtered.filter((c) => getAgeBadge(c.birthDate) === ageFilter);
		}

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter(
				(c) => c.name.toLowerCase().includes(query) || c.catNumber.toLowerCase().includes(query)
			);
		}

		return filtered;
	});

	const hasActiveFilters = $derived(!!sexFilter || !!ageFilter || !!searchQuery.trim());

	const handleSelectCat = (catId: string) => {
		selectedCatId = catId;
	};

	function clearFilters() {
		statusFilter = 'SOCIALIZE';
		sexFilter = '';
		ageFilter = '';
		searchQuery = '';
	}
</script>

<main class="flex flex-col gap-4 p-8">
	<!-- Bandeau stats -->
	<section class="grid grid-cols-5 gap-4">
		{#each statCards as card (card.label)}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-2">
					<Card.Title class="text-sm font-medium">{card.label}</Card.Title>
					<Icon
						name={card.icon}
						withWrapper={true}
						wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
						style="background: {getGradientStyle(card.theme)}"
						iconClass="h-5 w-5"
					/>
				</Card.Header>
				<Card.Content>
					<p class="text-2xl font-bold">{card.value}</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</section>

	<!-- Tableau + Panel détail -->
	<section class="grid grid-cols-1 gap-4 lg:grid-cols-5">
		<!-- Tableau -->
		<Card.Root class="flex flex-col lg:col-span-2">
			<Card.Header class="flex shrink-0 flex-row items-center justify-between">
				<Card.Title class="flex gap-4 text-2xl font-bold">
					{effectiveShowAll ? 'Tous les chats' : 'Mes chats'}
					{#if data.isAdmin}
						<Switch id="scope-toggle" bind:checked={showAll} onCheckedChange={resetView} />
					{/if}
				</Card.Title>

				<div class="flex items-center gap-4">
					<Button class="rounded-2xl" size="sm" onclick={() => (newCatOpen = true)}>
						<Icon name="plus" class="mr-2 h-4 w-4" />
						Nouveau chat
					</Button>
				</div>
			</Card.Header>

			<Card.Content>
				<!-- Barre de filtres -->
				<div class="grid items-center gap-2">
					<div class="flex flex-wrap gap-2">
						<!-- Status -->
						<SelectField
							id="host-type-filter"
							label=""
							options={CAT_STATUS}
							bind:value={statusFilter}
							placeholder="Status"
							class="w-30"
						/>

						<!-- Sex -->
						<SelectField
							id="host-type-filter"
							label=""
							options={CAT_SEX}
							bind:value={sexFilter}
							placeholder="Sex"
							class="w-30"
						/>

						<!-- Âge -->
						<SelectField
							id="host-type-filter"
							label=""
							options={CAT_AGE}
							bind:value={ageFilter}
							placeholder="Age"
							class="w-30"
						/>
					</div>

					<div class="flex items-center gap-2">
						<Button class="rounded-2xl" size="sm" onclick={clearFilters}>Réinitialiser</Button>

						<div class="relative flex-1">
							<Icon
								name="search"
								class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
							/>
							<Input
								type="text"
								placeholder="Chercher un chat..."
								bind:value={searchQuery}
								class="pl-9"
							/>
						</div>
					</div>
				</div>

				<div class="mt-2 h-[calc(120vh-24rem)] min-h-80 overflow-auto rounded-md">
					<Table.Root containerClass="overflow-visible">
						<Table.Header class="bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]">
							<Table.Row>
								<Table.Head>Photo</Table.Head>
								<Table.Head>Num</Table.Head>
								<Table.Head>Nom</Table.Head>
								<Table.Head>Sexe</Table.Head>
								<Table.Head>Âge</Table.Head>
								<Table.Head>Maladie</Table.Head>
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
									<Table.Cell colspan={6} class="py-8 text-center text-gray-500">
										{#if searchQuery}
											Aucun chat trouvé pour "{searchQuery}"
										{:else if hasActiveFilters}
											Aucun chat ne correspond aux filtres
										{:else}
											Aucun chat
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Panel détail -->
		<div class="col-span-3 overflow-y-auto">
			<CatPanel
				cat={selectedCat}
				hosts={data.hosts}
				volunteers={data.volunteers}
				isAdmin={data.isAdmin}
			/>
		</div>
	</section>
</main>

<!-- Dialog nouveau chat -->
<NewCatDialog
	bind:open={newCatOpen}
	onCancel={() => {
		newCatOpen = false;
	}}
/>
