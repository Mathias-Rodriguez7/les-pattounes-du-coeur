<!-- app/dashboard/news/+page.svelte -->
<script lang="ts">
	import ListDetailLayout from '#lib/components/layout/ListDetailLayout.svelte';
	import { desktop } from '#lib/utils/media.svelte.ts';
	import StatCards from '#lib/components/cards/StatCards.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import NewsRow from '#lib/components/news/NewsRow.svelte';
	import NewsPanel from '#lib/components/news/NewsPanel.svelte';
	import NewCreateDialog from '#lib/components/news/NewCreateDialog.svelte';
	import { NEWS_TYPE_OPTIONS } from '#lib/constants/news.js';
	import { Sparkles } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import NewsCatGenerateDialog from '#lib/components/news/NewsCatGenerateDialog.svelte';

	const { data } = $props();

	const news = $derived(data.news);
	const stats = $derived(data.stats);

	let selectedNewsId = $state<string | null>(null);
	const selectedNews = $derived(news.find((n) => n.id === selectedNewsId) ?? null);

	let mobilePanelOpen = $state(false);
	let newsCreateOpen = $state(false);
	let newsCatsOpen = $state(false);

	// ===== FILTRES =====
	let typeFilter = $state('');
	let searchQuery = $state('');

	function handleSelectNews(newsId: string) {
		selectedNewsId = newsId;
		if (!desktop.current) mobilePanelOpen = true;
	}

	const statCards = $derived([
		{ label: 'Publications', value: stats.total, icon: 'news', theme: 'cats' },
		{ label: 'News', value: stats.news, icon: 'alert', theme: 'dog' },
		{ label: 'Newsletters', value: stats.newsletters, icon: 'mail', theme: 'fa' },
		{ label: 'Histoires', value: stats.history, icon: 'mail', theme: 'fa' },
		{ label: 'News chats', value: stats.newscasts, icon: 'calendarCheck', theme: 'activ' },
		{ label: 'Évènements', value: stats.events, icon: 'calendarCheck', theme: 'adoptions' }
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
					n.cats.some((cat) => cat.name?.toLowerCase().includes(query))
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

<svelte:head>
	<title>News – Les Pattounes du Cœur</title>
</svelte:head>

<!-- Défini une fois, utilisé dans le PC et dans le Sheet mobile -->
{#snippet panel()}
	<NewsPanel
		news={selectedNews}
		cats={data.cats}
		canEdit={data.canManageNews}
		canDelete={data.canDeleteNews}
	/>
{/snippet}

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-10">
		<!-- ================= STATS ================= -->
		<StatCards cards={statCards} class="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" />

		<!-- ================= LISTE + DÉTAIL ================= -->
		<ListDetailLayout
			bind:open={mobilePanelOpen}
			title={selectedNews?.title ?? 'Détail de la news'}
		>
			{#snippet list()}
				<!-- LISTE : sur PC, sa hauteur suit celle du panneau -->
				<div class="relative min-w-0 lg:col-span-2 lg:min-h-[calc(100dvh-14rem)]">
					<Card.Root class="flex flex-col lg:absolute lg:inset-0">
						<Card.Header
							class="flex shrink-0 flex-row flex-wrap items-center justify-between gap-2"
						>
							<Card.Title class="text-xl font-bold sm:text-2xl">
								News
								<span class="text-base font-normal text-muted-foreground">
									({filteredNews.length})
								</span>
							</Card.Title>

							{#if data.canManageNews}
								<div class="flex items-center gap-2">
									<!-- Action secondaire : tonale (rose pâle), avant l'action principale -->
									<Button
										size="sm"
										class="rounded-2xl bg-accent text-accent-foreground shadow-none hover:bg-accent/80"
										onclick={() => (newsCatsOpen = true)}
									>
										<Sparkles class="size-4" />
										News chats
									</Button>

									<!-- Action principale : pleine, à droite -->
									<Button class="rounded-2xl" size="sm" onclick={() => (newsCreateOpen = true)}>
										<Icon name="plus" class="h-4 w-4" />
										<span class="hidden sm:inline">News</span>
										<span class="sm:hidden">Ajouter</span>
									</Button>
								</div>
							{/if}
						</Card.Header>

						<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
							<!-- Un seul filtre : pas besoin de le replier sur mobile -->
							<TableToolbar
								bind:search={searchQuery}
								searchPlaceholder="Chercher un titre ou un chat…"
								searchLabel="Chercher une news par titre ou par chat"
								onReset={clearFilters}
							>
								{#snippet filters()}
									<SelectField
										id="news-type-filter"
										label=""
										options={NEWS_TYPE_OPTIONS}
										bind:value={typeFilter}
										placeholder="Type"
										class="w-36 sm:w-40"
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
												<Table.Cell colspan={3} class="text-muted-foreground py-10 text-center">
													{#if searchQuery.trim()}
														Aucune news trouvée pour « {searchQuery.trim()} »
													{:else if hasActiveFilters}
														Aucune news ne correspond à ce filtre.
													{:else}
														Aucune news pour le moment.
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
				{@render panel()}
			{/snippet}
		</ListDetailLayout>
	</div>
</main>

{#if data.canManageNews}
	<NewCreateDialog bind:open={newsCreateOpen} onCancel={() => (newsCreateOpen = false)} />
	<NewsCatGenerateDialog
		bind:open={newsCatsOpen}
		cats={data.adoptableCats}
		candidateIds={data.candidateIds}
	/>
{/if}
