<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Cat, Plus } from '@lucide/svelte';
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
			label: 'Chats gérés',
			value: `${stats.withVolunteer} / ${stats.total}`,
			icon: Cat
		},
		{
			label: 'Infos incomplètes',
			value: stats.incomplete,
			icon: Cat
		},
		{
			label: "En famille d'accueil",
			value: `${stats.withHost} / ${stats.total}`,
			icon: Cat
		},
		{
			label: 'Sans FA',
			value: stats.withoutHost,
			icon: Cat
		}
	]);

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
	<section class="grid grid-cols-4 gap-4">
		{#each statCards as card (card.label)}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-2">
					<Card.Title class="text-sm font-medium">{card.label}</Card.Title>
					<card.icon class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<p class="text-2xl font-bold">{card.value}</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</section>

	<!-- Tableau + Panel détail -->
	<section class="grid grid-cols-3 gap-4">
		<!-- Tableau -->
		<Card.Root class="col-span-2">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-2xl font-bold">Chats en gestion</Card.Title>
				<Button size="sm" onclick={() => (newCatOpen = true)}>
					<Plus class="mr-2 h-4 w-4" />
					Nouveau chat
				</Button>
			</Card.Header>
			<Card.Content>
				<Tabs.Root value={currentTab} onValueChange={onTabChange} class="w-full">
					<Tabs.List>
						<Tabs.Trigger value="all">Tout</Tabs.Trigger>
						<Tabs.Trigger value="with_fa">Avec FA</Tabs.Trigger>
						<Tabs.Trigger value="without_fa">Sans FA</Tabs.Trigger>
						<Tabs.Trigger value="adopted">Adoptés</Tabs.Trigger>
					</Tabs.List>

					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Photo</Table.Head>
								<Table.Head>Nom</Table.Head>
								<Table.Head>Sexe</Table.Head>
								<Table.Head>Âge</Table.Head>
								<Table.Head>Statut</Table.Head>
								<Table.Head title="OK chien">🐕</Table.Head>
								<Table.Head title="OK chat">🐈</Table.Head>
								<Table.Head title="OK enfant">👶</Table.Head>
								<Table.Head title="Jardin">🏡</Table.Head>
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
		<CatPanel
			cat={selectedCat}
			hosts={data.hosts}
			volunteers={data.volunteers}
			isAdmin={data.isAdmin}
		/>
	</section>
</main>

<!-- Dialog nouveau chat -->
<NewCatDialog bind:open={newCatOpen} />
