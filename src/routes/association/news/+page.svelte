<script lang="ts">
	import NewsBigCard from '$lib/components/NewsBigCard.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsBigCatCard from '$lib/components/NewsBigCatCard.svelte';
	import type { News } from '$lib/types/news';
	import NewsCatCard from '$lib/components/NewsCatCard.svelte';

	const newsImages = {
		NEWS: '/img/news/news.png',
		EVENT: '/img/news/event.png',
		HISTORY: '/img/news/historic.png',
		NEWSCATS: '/img/news/cat.news.png',
		NEWSLETTER: '/img/news/news.letter.png'
	};

	function getNewsImage(news: News) {
		return newsImages[news.type] ?? '/img/news/default.png';
	}

	let { data } = $props();

	const allNews = $derived(data.news ?? []);

	let selectedNews = $state<News | null>(null);

	const latestNews = $derived(allNews?.[0] ?? null);

	const featuredNews = $derived(selectedNews ?? latestNews);

	const listNews = $derived(
		allNews?.filter((n) => {
			if (n.id === featuredNews?.id) return false;

			// 💥 filtre les NEWSCATS sans chats
			if (n.type === 'NEWSCATS' && (!n.cats || n.cats.length === 0)) {
				return false;
			}

			return true;
		}) ?? []
	);

	function selectNews(news: News) {
		selectedNews = news;
	}
</script>

<main class="bg-background min-h-screen p-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<h1 class="text-3xl font-bold">News</h1>

		<!-- GRID MAGAZINE -->
		<section class="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<!-- 🟦 FEATURED -->
			<div class="h-full lg:col-span-3 lg:row-span-1">
				{#if featuredNews.type === 'NEWSCATS'}
					<NewsBigCatCard
						title={featuredNews.title}
						date={featuredNews.formattedDate}
						cats={featuredNews.cats}
					/>
				{:else}
					<NewsBigCard
						title={featuredNews.title}
						image={getNewsImage(featuredNews)}
						content={featuredNews.content}
						date={featuredNews.formattedDate}
					/>
				{/if}
			</div>

			<!-- 🟨 LIST -->

			{#each listNews as news (news.id)}
				<button class="cursor-pointer" onclick={() => selectNews(news)}>
					{#if news.type === 'NEWSCATS'}
						<NewsCatCard
							title={news.title}
							image={news.image}
							date={news.formattedDate}
							cats={news.cats}
						/>
					{:else}
						<NewsCard
							title={news.title}
							image={news.image}
							content={news.content}
							date={news.formattedDate}
						/>
					{/if}
				</button>
			{/each}
		</section>
	</div>
</main>
