<!-- app/association/news/+page.svelte -->
<script lang="ts">
	import NewsDialog from '#lib/components/news/NewsDialog.svelte';
	import NewsCard from '#lib/components/news/NewsCard.svelte';
	import NewsCatCard from '#lib/components/news/NewsCatCard.svelte';
	import type { NewsFull } from '#lib/types/news.ts';
	import * as Dialog from '#lib/components/ui/dialog/index.ts';
	import TableToolbar from '#lib/components/tables/TableToolbar.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import { NEWS_TYPE_OPTIONS } from '#lib/constants/news.ts';
	import { fade, fly } from 'svelte/transition';

	type PageData = {
		news: NewsFull[];
		selectedNewsId?: string | null;
	};

	let { data }: { data: PageData } = $props();

	let selectedNews = $state<NewsFull | null>(null);
	let isOpen = $state(false);

	function openNews(news: NewsFull) {
		selectedNews = news;
		isOpen = true;
	}

	// ===== FILTRES : le même système que les tableaux du dashboard (valeur '' = pas de filtre) =====
	let search = $state('');
	let typeFilter = $state('');

	function resetFilters() {
		search = '';
		typeFilter = '';
	}

	const filteredNews = $derived.by(() => {
		const query = search.trim().toLowerCase();
		return data.news.filter(
			(news) =>
				(!query || (news.title ?? '').toLowerCase().includes(query)) &&
				(!typeFilter || news.type === typeFilter)
		);
	});

	$effect(() => {
		if (!data.selectedNewsId) return;

		const news = data.news.find((n) => n.id === data.selectedNewsId);

		if (news) {
			selectedNews = news;
			isOpen = true;
		}
	});
	import PageHeader from '#lib/components/layout/PageHeader.svelte';
</script>

<svelte:head>
	<title>News – Les Pattounes du Cœur</title>
	<meta
		name="description"
		content="Les dernières nouvelles de l'association Les Pattounes du Cœur."
	/>
</svelte:head>

<main in:fade={{ duration: 200 }} class="flex justify-center p-4">
	<div in:fly={{ y: 20, duration: 300 }} class="flex w-full flex-col gap-6 p-8">
		<PageHeader title="News" />

		<!-- Recherche + bouton Filtres : comme dans les tableaux du dashboard -->
		<div class="rounded-3xl bg-card p-4 shadow-sm">
			<TableToolbar
				bind:search
				searchPlaceholder="Rechercher une news…"
				searchLabel="Rechercher une news par son titre"
				onReset={resetFilters}
				searchClass="w-full sm:ml-auto sm:w-72"
				activeCount={typeFilter ? 1 : 0}
			>
				{#snippet filters()}
					<SelectField
						id="news-public-type"
						label=""
						options={NEWS_TYPE_OPTIONS}
						bind:value={typeFilter}
						placeholder="Type"
						class="w-full sm:w-44"
					/>
				{/snippet}
			</TableToolbar>
		</div>

		<p class="-mt-2 text-sm text-muted-foreground" aria-live="polite">
			{#if search.trim() || typeFilter}
				{filteredNews.length}
				{filteredNews.length > 1 ? 'news correspondent' : 'news correspond'} à vos critères
			{:else}
				{filteredNews.length} news
			{/if}
		</p>

		<!-- ===================== -->
		<!-- GRID -->
		<!-- ===================== -->
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredNews as news (news.id)}
				<button type="button" class="text-left" onclick={() => openNews(news)}>
					{#if news.type === 'NEWSCATS'}
						<NewsCatCard {news} />
					{:else}
						<NewsCard {news} />
					{/if}
				</button>
			{:else}
				<div class="col-span-full flex flex-col items-center gap-3 py-20 text-center">
					<h2 class="text-xl font-semibold">Aucune news trouvée</h2>
					<p class="text-sm text-muted-foreground">Essayez un autre mot ou un autre type.</p>
					<button
						type="button"
						onclick={resetFilters}
						class="text-sm text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
					>
						Réinitialiser les filtres
					</button>
				</div>
			{/each}
		</section>

		<!-- ===================== -->
		<!-- DIALOG -->
		<!-- ===================== -->
		<Dialog.Root bind:open={isOpen}>
			{#if selectedNews}
				<NewsDialog {selectedNews} />
			{/if}
		</Dialog.Root>
	</div>
</main>
