<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/Icon.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import NewCatDialog from '$lib/components/cats/NewCatDialog.svelte';
	import CatPanel from '$lib/components/cats/CatPanel.svelte';
	import CatRow from '$lib/components/cats/CatRow.svelte';

	const { data } = $props();

	const cats = $derived(data.cats);
	const stats = $derived(data.stats);

	let selectedCatId = $state<string | null>(null);
	let selectedCat = $derived(cats.find((c) => c.id === selectedCatId) ?? null);

	let newCatOpen = $state(false);
	let currentPage = $state(1);
	let currentTab = $state('all');

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

	const compatibilityIcons = [
		{ icon: 'dog', theme: 'volunteers', title: 'Compatible avec les chiens' },
		{ icon: 'cat', theme: 'cats', title: 'Compatible avec les chats' },
		{ icon: 'baby', theme: 'baby', title: 'Compatible avec les enfants' },
		{ icon: 'trees', theme: 'fa', title: 'Nécessite un jardin' }
	];

	const filteredCats = $derived(() => {
		switch (currentTab) {
			case 'with_fa':
				return cats.filter((c) => c.currentHost !== null);
			case 'without_fa':
				return cats.filter((c) => c.currentHost === null && c.status !== 'ADOPTED');
			case 'adopted':
				return cats.filter((c) => c.status === 'ADOPTED');
			default:
				return cats;
		}
	});

	const paginatedCats = $derived(
		filteredCats().slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	function onTabChange(tab: string) {
		currentTab = tab;
		currentPage = 1;
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
	<section class="grid h-[calc(97vh-50px)] grid-cols-1 gap-4 lg:grid-cols-5">
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
				<Tabs.Root value={currentTab} onValueChange={onTabChange} class="w-full">
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
						<Tabs.Trigger value="adopted" class="relative">
							Libre
							{#if currentTab === 'adopted'}
								<div class="bg-primary absolute right-0 bottom-0 left-0 h-1 rounded-2xl"></div>
							{/if}
						</Tabs.Trigger>
					</Tabs.List>

					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Photo</Table.Head>
								<Table.Head>Nom</Table.Head>
								<Table.Head>Sexe</Table.Head>
								<Table.Head>Âge</Table.Head>
								<Table.Head>Statut</Table.Head>
								{#each compatibilityIcons as compat (compat.title)}
									<Table.Head title={compat.title} class="text-center">
										<div class="flex justify-center text-white">
											<Icon
												name={compat.icon}
												withWrapper={true}
												wrapperClass="flex h-8 w-8 items-center justify-center rounded-lg"
												style="background: {getGradientStyle(compat.theme)}"
												iconClass="h-5 w-5"
											/>
										</div>
									</Table.Head>
								{/each}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each paginatedCats as cat (cat.id)}
								<CatRow {cat} onclick={() => (selectedCatId = cat.id)} />
							{/each}
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
<NewCatDialog bind:open={newCatOpen} />
