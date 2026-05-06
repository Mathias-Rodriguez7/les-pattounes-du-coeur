<script lang="ts">
	import NewsDialog from '$lib/components/NewsDialog.svelte';
	import NewsCard from '$lib/components/NewsCard.svelte';
	import NewsCatCard from '$lib/components/NewsCatCard.svelte';
	import type { News } from '$lib/types/news';

	import * as Dialog from '$lib/components/ui/dialog';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Search } from 'lucide-svelte';

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

	// -----------------------------
	// FILTER STATE
	// -----------------------------
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
		data.news.filter((news) => {
			const matchSearch =
				!filters.search || news.title?.toLowerCase().includes(filters.search.toLowerCase());

			const active = Object.entries(filters.toggles).filter(([, v]) => v);

			const matchToggles =
				active.length === 0 ||
				active.some(([key]) => news.type === filterToTypeMap[key as keyof typeof filterToTypeMap]);

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
	<div in:fly={{ y: 20, duration: 300 }} class="flex w-full flex-col gap-6 p-8">
		<h1 class="text-3xl font-bold">News</h1>

		<!-- ===================== -->
		<!-- TOP BAR -->
		<!-- ===================== -->
		<div
			class="bg-primary-foreground flex flex-wrap items-center justify-between gap-4 rounded-4xl px-6 py-4"
		>
			<!-- FILTER SHEET -->
			<Sheet.Root>
				<Sheet.Trigger>
					<Button class="rounded-2xl">Filtres</Button>
				</Sheet.Trigger>

				<Sheet.Content side="left" class="w-95 space-y-8 p-6">
					<!-- HEADER -->
					<div class="space-y-1">
						<h2 class="text-2xl font-bold">Filtres</h2>
						<p class="text-muted-foreground text-sm">Affinez votre recherche</p>
					</div>

					<!-- TYPES -->
					<div class="space-y-4">
						<h3 class="text-sm font-semibold tracking-wide uppercase opacity-70">Types</h3>

						{#each Object.entries(filters.toggles) as [key] (key)}
							<Label
								class="hover:bg-secondary flex items-center gap-3 rounded-4xl border p-3 transition"
							>
								<Checkbox
									checked={filters.toggles[key as keyof typeof filters.toggles]}
									onCheckedChange={(v) => {
										filters.toggles[key as keyof typeof filters.toggles] = Boolean(v);
									}}
								/>
								<span class="text-sm">{key}</span>
							</Label>
						{/each}
					</div>

					<Button variant="outline" class="w-full" onclick={resetFilters}>
						Réinitialiser les filtres
					</Button>
				</Sheet.Content>
			</Sheet.Root>

			<!-- SEARCH -->
			<div class="flex items-center gap-2">
				<Search class="size-4 opacity-60" />
				<Input bind:value={filters.search} placeholder="Rechercher..." />
			</div>
		</div>

		<!-- ===================== -->
		<!-- GRID -->
		<!-- ===================== -->
		<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredNews as news (news.id)}
				<button class="text-left" onclick={() => openNews(news)}>
					{#if news.type === 'NEWSCATS'}
						<NewsCatCard {news} />
					{:else}
						<NewsCard {news} />
					{/if}
				</button>
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
