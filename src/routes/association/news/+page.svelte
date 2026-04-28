<script lang="ts">
	import NewsBigCard from '$lib/components/NewsBigCard.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import type { News } from '$lib/types/news';

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

	const allNews = $derived(data.news);

	let selectedNews = $state<News | null>(null);

	const latestNews = $derived(allNews[0]);

	const featuredNews = $derived(selectedNews ?? latestNews);

	const listNews = $derived(allNews.filter((n) => n.id !== featuredNews?.id));

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
				<NewsBigCard
					title={featuredNews.title}
					image={getNewsImage(featuredNews)}
					content={featuredNews.content}
					date={featuredNews.date}
				/>
			</div>

			<!-- 🟨 LIST -->

			{#each listNews as news (news.id)}
				<button class="cursor-pointer" onclick={() => selectNews(news)}>
					<NewsCard title={news.title} image={getNewsImage(news)} content={news.content} />
				</button>
			{/each}
		</section>
	</div>
</main>
