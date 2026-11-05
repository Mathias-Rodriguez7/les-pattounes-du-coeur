<!-- app/dashboard/news/+page.svelte -->
<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import NewsRow from '$lib/components/news/NewsRow.svelte';
	import NewsPanel from '$lib/components/news/NewsPanel.svelte';
	import NewCreateDialog from '$lib/components/news/NewCreateDialog.svelte';
	import { NEWS_TYPE_OPTIONS } from '$lib/constants/news.js';
	import { X } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';

	const { data } = $props();

	const news = $derived(data.news);
	const stats = $derived(data.stats);

	// true à partir de 1024 px (valeur supposée côté serveur : ordinateur)
	const isDesktop = new MediaQuery('min-width: 1024px', true);

	let selectedNewsId = $state<string | null>(null);
	const selectedNews = $derived(news.find((n) => n.id === selectedNewsId) ?? null);

	let mobilePanelOpen = $state(false);
	let newsCreateOpen = $state(false);

	// ===== FILTRES =====
	let typeFilter = $state('');
	let searchQuery = $state('');

	function handleSelectNews(newsId: string) {
		selectedNewsId = newsId;
		if (!isDesktop.current) mobilePanelOpen = true;
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
		<section class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
			{#each statCards as card (card.label)}
				<Card.Root class="gap-2 py-4">
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
						<Card.Title class="text-xl font-bold sm:text-2xl">
							News
							<span class="text-muted-foreground text-base font-normal">
								({filteredNews.length})
							</span>
						</Card.Title>

						{#if data.canManageNews}
							<Button class="rounded-2xl" size="sm" onclick={() => (newsCreateOpen = true)}>
								<Icon name="plus" class="h-4 w-4" />
								<span class="hidden sm:inline">Nouvelle news</span>
								<span class="sm:hidden">Ajouter</span>
							</Button>
						{/if}
					</Card.Header>

					<Card.Content class="flex min-h-0 flex-1 flex-col gap-3">
						<!-- Un seul filtre : pas besoin de le replier sur mobile -->
						<div class="flex flex-wrap items-center gap-2">
							<SelectField
								id="news-type-filter"
								label=""
								options={NEWS_TYPE_OPTIONS}
								bind:value={typeFilter}
								placeholder="Type"
								class="w-36 sm:w-40"
							/>
							<Button class="rounded-2xl" size="sm" variant="outline" onclick={clearFilters}>
								Réinitialiser
							</Button>
						</div>

						<div class="relative">
							<Icon
								name="search"
								class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
							/>
							<Input
								type="search"
								placeholder="Chercher un titre ou un chat…"
								aria-label="Chercher une news par titre ou par chat"
								bind:value={searchQuery}
								class="pl-9"
							/>
						</div>

						<!-- Tableau -->
						<div class="min-h-0 flex-1 overflow-x-auto rounded-md lg:overflow-y-auto">
							<Table.Root containerClass="overflow-visible">
								<Table.Header
									class="bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]"
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

			<!-- DÉTAIL : ordinateur -->
			{#if isDesktop.current}
				<div class="min-w-0 lg:col-span-3">
					{@render panel()}
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
					{selectedNews?.title ?? 'Détail de la news'}
				</Sheet.Title>
				<Sheet.Close
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Fermer et revenir à la liste"
				>
					<X class="size-5" />
				</Sheet.Close>
			</header>

			<div class="p-3">
				{@render panel()}
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}

{#if data.canManageNews}
	<NewCreateDialog bind:open={newsCreateOpen} onCancel={() => (newsCreateOpen = false)} />
{/if}
