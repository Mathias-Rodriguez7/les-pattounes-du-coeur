<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import NewsRow from '$lib/components/news/NewsRow.svelte';
	import NewsPanel from '$lib/components/news/NewsPanel.svelte';
	import NewNewsDialog from '$lib/components/news/NewNewsDialog.svelte';
	import { NEWS_TYPE_OPTIONS } from '$lib/constants/news.js';

	const { data } = $props();

	let news = $derived(data.news);
	const stats = $derived(data.stats);

	let selectedNewsId = $state<string | null>(null);
	let selectedNews = $derived(news.find((n) => n.id === selectedNewsId) ?? null);

	let newNewsOpen = $state(false);

	let typeFilter = $state('');
	let searchQuery = $state('');

	const handleSelectNews = (newsId: string) => {
		selectedNewsId = newsId;
	};

	const statCards = $derived([
		{ label: 'Publications', value: stats.total, icon: 'news', theme: 'cats' },
		{ label: 'Sans média', value: stats.withoutMedia, icon: 'alert', theme: 'dog' },
		{ label: 'Newsletters', value: stats.newsletters, icon: 'news', theme: 'fa' },
		{ label: 'Évènements', value: stats.events, icon: 'CirclePlay', theme: 'activ' },
		{ label: 'Publiées cette année', value: stats.thisYear, icon: 'heart', theme: 'adoptions' }
	]);

	const filteredNews = $derived.by(() => {
		let filtered = news;

		if (typeFilter) {
			filtered = filtered.filter((n) => n.type === typeFilter);
		}

		const query = searchQuery.trim().toLowerCase();
		if (query) {
			filtered = filtered.filter(
				(n) =>
					n.title.toLowerCase().includes(query) ||
					n.cats.some((nc) => nc.cat.name?.toLowerCase().includes(query))
			);
		}

		return filtered;
	});

	const hasActiveFilters = $derived(!!typeFilter || !!searchQuery.trim());

	function clearFilters() {
		typeFilter = '';
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
		<Card.Root class="flex flex-col lg:col-span-2">
			<Card.Header class="flex shrink-0 flex-row items-center justify-between">
				<Card.Title class="text-2xl font-bold">News</Card.Title>
				<Button class="rounded-2xl" size="sm" onclick={() => (newNewsOpen = true)}>
					<Icon name="plus" class="mr-2 h-4 w-4" />
					Nouvelle news
				</Button>
			</Card.Header>

			<Card.Content>
				<div class="grid items-center gap-2">
					<div class="flex flex-wrap gap-2">
						<SelectField
							id="news-type-filter"
							label=""
							options={NEWS_TYPE_OPTIONS}
							bind:value={typeFilter}
							placeholder="Type"
							class="w-40"
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
								placeholder="Chercher un titre ou un chat..."
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
								<Table.Head>Titre</Table.Head>
								<Table.Head>Type</Table.Head>
								<Table.Head>Date</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filteredNews as item (item.id)}
								<NewsRow
									news={item}
									onclick={() => handleSelectNews(item.id)}
									isSelected={selectedNewsId === item.id}
								/>
							{:else}
								<Table.Row>
									<Table.Cell colspan={4} class="text-muted-foreground py-8 text-center">
										{#if searchQuery}
											Aucune news trouvée pour "{searchQuery}"
										{:else if hasActiveFilters}
											Aucune news ne correspond aux filtres
										{:else}
											Aucune news
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="col-span-3 overflow-y-auto">
			<NewsPanel news={selectedNews} isAdmin={data.isAdmin} />
		</div>
	</section>

	<NewNewsDialog bind:open={newNewsOpen} onCancel={() => (newNewsOpen = false)} />
</main>
