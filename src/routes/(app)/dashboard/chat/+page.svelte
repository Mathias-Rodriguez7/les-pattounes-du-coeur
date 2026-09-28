<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import NewCatDialog from '$lib/components/cats/NewCatDialog.svelte';
	import CatPanel from '$lib/components/cats/CatPanel.svelte';
	import CatRow from '$lib/components/cats/CatRow.svelte';

	const { data } = $props();

	let cats = $derived(data.cats);

	const stats = $derived(data.stats);

	let selectedCatId = $state<string | null>(null);
	let selectedCat = $derived(cats.find((c) => c.id === selectedCatId) ?? null);

	let newCatOpen = $state(false);
	let currentPage = $state(1);
	let currentTab = $state('all');
	let searchQuery = $state('');

	const handleSelectCat = (catId: string) => {
		selectedCatId = catId;
	};
	const PAGE_SIZE = 10;

	const statCards = $derived([
		{
			label: 'Chats sous ma gestion',
			value: stats.managedByUser,
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

	// ✅ NEW: Filtrer par tab ET par recherche
	const filteredCats = $derived(() => {
		let filtered = [];

		// 1️⃣ Filtre par tab
		switch (currentTab) {
			case 'with_fa':
				filtered = cats.filter((c) => c.currentHost !== null);
				break;
			case 'without_fa':
				filtered = cats.filter((c) => c.currentHost === null && c.status !== 'ADOPTED');
				break;
			case 'adopted':
				filtered = cats.filter((c) => c.status === 'ADOPTED');
				break;
			default:
				filtered = cats;
		}

		// 2️⃣ Filtre par recherche (sur le nom et l'ID)
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(c) => c.name.toLowerCase().includes(query) || c.catNumber.toLowerCase().includes(query)
			);
		}

		return filtered;
	});

	const paginatedCats = $derived(
		filteredCats().slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	function onTabChange(tab: string) {
		currentTab = tab;
		currentPage = 1; // ✅ Reset à la page 1
		searchQuery = ''; // ✅ Reset la recherche aussi
	}

	// ✅ NEW: Reset la page quand on cherche
	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		searchQuery = target.value;
		currentPage = 1; // Revenir à la page 1
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
				<Card.Title class="text-2xl font-bold">Chats en gestion</Card.Title>
				<Button size="sm" onclick={() => (newCatOpen = true)}>
					<Icon name="plus" class="mr-2 h-4 w-4" />
					Nouveau chat
				</Button>
			</Card.Header>
			<Card.Content>
				<div class="mb-4 text-end">
					<Input
						type="text"
						placeholder="Chercher un chat..."
						bind:value={searchQuery}
						onchange={handleSearch}
						class="w-1/3"
					/>
				</div>

				<Tabs.Root value={currentTab} onValueChange={onTabChange} class="min-w-full">
					<Tabs.List class="bg-muted grid grid-cols-5 gap-2 p-1">
						<Tabs.Trigger value="all" class="relative">
							Tout
							{#if currentTab === 'all'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-2xl"></div>
							{/if}
						</Tabs.Trigger>
						<Tabs.Trigger value="with_fa" class="relative">
							En gestion
							{#if currentTab === 'with_fa'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-2xl"></div>
							{/if}
						</Tabs.Trigger>
						<Tabs.Trigger value="without_fa" class="relative">
							Sans FA
							{#if currentTab === 'without_fa'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-2xl"></div>
							{/if}
						</Tabs.Trigger>
						<Tabs.Trigger value="adopted" class="relative">
							Adoptés
							{#if currentTab === 'adopted'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-2xl"></div>
							{/if}
						</Tabs.Trigger>
						<Tabs.Trigger value="free" class="relative">
							Libre
							{#if currentTab === 'free'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-2xl"></div>
							{/if}
						</Tabs.Trigger>
					</Tabs.List>

					<Table.Root>
						<Table.Header>
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
							{#if paginatedCats.length > 0}
								{#each paginatedCats as cat (cat.id)}
									<CatRow
										{cat}
										onclick={() => handleSelectCat(cat.id)}
										isSelected={selectedCatId === cat.id}
									/>
								{/each}
							{:else}
								<Table.Row>
									<Table.Cell class="col-span-9 py-8 text-center text-gray-500">
										{#if searchQuery}
											Aucun chat trouvé pour "{searchQuery}"
										{:else}
											Aucun chat dans cette catégorie
										{/if}
									</Table.Cell>
								</Table.Row>
							{/if}
						</Table.Body>
					</Table.Root>

					<!-- Pagination -->
					<div class="mt-4 flex justify-center">
						<Pagination.Root
							count={filteredCats().length}
							perPage={PAGE_SIZE}
							bind:page={currentPage}
						>
							{#snippet children({ pages, currentPage: cp })}
								<Pagination.Content>
									<Pagination.Item>
										<Pagination.Previous />
									</Pagination.Item>
									{#each pages as page (page.key)}
										{#if page.type === 'ellipsis'}
											<Pagination.Item>
												<Pagination.Ellipsis />
											</Pagination.Item>
										{:else}
											<Pagination.Item>
												<Pagination.Link {page} isActive={cp === page.value}>
													{page.value}
												</Pagination.Link>
											</Pagination.Item>
										{/if}
									{/each}
									<Pagination.Item>
										<Pagination.Next />
									</Pagination.Item>
								</Pagination.Content>
							{/snippet}
						</Pagination.Root>
					</div>
				</Tabs.Root>
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
