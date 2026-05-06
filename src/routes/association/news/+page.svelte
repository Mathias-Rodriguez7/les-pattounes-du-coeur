<script lang="ts">
	import NewsDialog from '$lib/components/NewsDialog.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsCatCard from '$lib/components/NewsCatCard.svelte';
	import type { News } from '$lib/types/news';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { fade, fly } from 'svelte/transition';

	type PageData = {
		news: News[];
		selectedNews?: string | null;
	};

	let { data }: { data: PageData } = $props();

	let selectedNews = $state<News | null>(null);
	let isOpen = $state(false);

	function openNews(news: News) {
		selectedNews = news;
		isOpen = true;
	}

	let filters = $state({
		search: '',
		toggles: {
			news: false,
			event: false,
			history: false,
			newsCat: false,
			newsLetter: false
		}
	});

	function toggleFilter(key: keyof typeof filters.toggles) {
		filters.toggles[key] = !filters.toggles[key];
	}

	function resetFilters() {
		filters.search = '';
		Object.keys(filters.toggles).forEach((key) => {
			filters.toggles[key as keyof typeof filters.toggles] = false;
		});
	}

	const filterToTypeMap = {
		news: 'NEWS',
		event: 'EVENT',
		history: 'HISTORY',
		newsCat: 'NEWSCATS',
		newsLetter: 'NEWSLETTER'
	} as const;

	let filteredNews = $derived(
		data.news.filter((news: News) => {
			const matchSearch =
				!filters.search || news.title?.toLowerCase().includes(filters.search.toLowerCase());

			const matchToggles =
				(Object.entries(filters.toggles) as Array<[keyof typeof filters.toggles, boolean]>).some(
					([key, value]) => {
						if (!value) return false;
						return news.type === filterToTypeMap[key];
					}
				) || Object.values(filters.toggles).every((v) => !v);

			return matchSearch && matchToggles;
		})
	);

	$effect(() => {
		if (!data.selectedNews) return;

		const news = data.news.find((n) => n.id === data.selectedNews);

		if (news) {
			selectedNews = news;
			isOpen = true;
		}
	});
</script>

<main in:fade={{ duration: 200 }} class="flex justify-center p-4">
	<div in:fly={{ y: 20, duration: 300 }} class="max-w-10xl flex w-full flex-col gap-6 p-8">
		<h1 class="text-3xl font-bold">News</h1>

		<!-- FILTERS -->
		<div
			class="bg-primary-foreground flex flex-wrap items-center justify-between gap-4 rounded-4xl px-6 py-4"
		>
			<div class="flex flex-wrap gap-2">
				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.news ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('news')}
				>
					News
				</button>

				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.newsLetter ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('newsLetter')}
				>
					News Letter
				</button>

				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.newsCat ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('newsCat')}
				>
					Nouveaux Chats
				</button>

				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.event ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('event')}
				>
					Événement
				</button>

				<button
					class={`rounded-full px-4 py-2 text-sm ${
						filters.toggles.history ? 'bg-secondary text-white' : 'bg-background'
					}`}
					onclick={() => toggleFilter('history')}
				>
					Histoire
				</button>

				<button class="bg-primary rounded-full px-4 py-2 text-sm text-white" onclick={resetFilters}>
					Reset
				</button>
			</div>

			<div class="flex items-center gap-2">
				<Search />
				<Input
					type="text"
					placeholder="Rechercher..."
					bind:value={filters.search}
					class="bg-background!"
				/>
			</div>
		</div>

		<!-- GRID -->
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredNews as news (news.id)}
				<button class="w-full text-left" onclick={() => openNews(news)}>
					{#if news.type === 'NEWSCATS'}
						<NewsCatCard
							title={news.title}
							image={news.image}
							date={news.formattedDate}
							cats={news.cats}
						/>
					{:else}
						<NewsCard {news} />
					{/if}
				</button>
			{/each}
		</section>

		<!-- DIALOG (clean, unique source of truth) -->
		<Dialog.Root bind:open={isOpen}>
			{#if selectedNews}
				<NewsDialog {selectedNews} />
			{/if}
		</Dialog.Root>
	</div>
</main>
