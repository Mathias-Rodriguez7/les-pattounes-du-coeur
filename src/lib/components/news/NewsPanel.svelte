<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { Pencil } from '@lucide/svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { formatDate } from '$lib/utils/date';
	import SectionCard from '../cards/SectionCard.svelte';
	import NewsEditForm from './NewsEditForm.svelte';
	import { NEWS_SECTION_CONFIG, NEWS_TYPE_CONFIG } from '$lib/constants/news';
	import type { NewsFull, NewsEditData } from '$lib/types/news';

	const {
		news,
		cats = [],
		isAdmin = false
	}: {
		news: NewsFull | null;
		cats?: { id: string; name: string; catNumber: string }[];
		isAdmin?: boolean;
	} = $props();

	let isEditing = $state(false);

	let editData = $state<NewsEditData>({
		title: '',
		content: '',
		type: 'NEWS',
		mediaUrl: '',
		catIds: []
	});

	const startEditing = () => {
		if (!news) return;
		editData = {
			title: news.title,
			content: news.content ?? '',
			type: news.type,
			mediaUrl: news.mediaUrl ?? '',
			catIds: news.cats.map((nc) => nc.cat.id)
		};
		isEditing = true;
	};

	const handleCancelEdit = () => {
		isEditing = false;
	};

	const handleSuccessfulSave = () => {
		if (!news) return;
		news.title = editData.title;
		news.content = editData.content;
		news.type = editData.type;
		news.mediaUrl = editData.mediaUrl;
		isEditing = false;
	};

	const currentType = $derived(
		news?.type && news.type in NEWS_TYPE_CONFIG
			? NEWS_TYPE_CONFIG[news.type]
			: NEWS_TYPE_CONFIG.NEWS
	);
</script>

{#if news}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== HEADER ===== -->
			<Card.Header>
				<div class="flex h-25 justify-between">
					<div class="flex gap-8">
						<!-- Icône + type -->
						<div class="flex flex-col items-center justify-around">
							{#key news.type}
								<Icon
									name={currentType.icon}
									withWrapper={true}
									wrapperClass="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
									style="background: {getGradientStyle(currentType.theme)}"
									iconClass="h-5 w-5"
								/>
							{/key}
							<Badge class={currentType.color}>{currentType.label}</Badge>
						</div>

						<!-- Titre + date -->
						<div class="flex flex-col justify-around">
							<Card.Title class="text-2xl">{news.title}</Card.Title>
							<Card.Description class="text-xl">
								{formatDate(new Date(news.created_at))}
							</Card.Description>
						</div>
					</div>

					<div>
						{#if isAdmin}
							<Button variant="ghost" size="icon" onclick={startEditing}>
								<Pencil class="h-5 w-5" />
							</Button>
						{/if}
					</div>
				</div>
			</Card.Header>

			<!-- ===== CONTENU ===== -->
			<Card.Content class="grid grid-cols-1 gap-6">
				<Separator />

				<section>
					<!-- Contenu -->
					<SectionCard
						icon={NEWS_SECTION_CONFIG.content.icon}
						title={NEWS_SECTION_CONFIG.content.label}
						color={NEWS_SECTION_CONFIG.content.color}
					>
						{#if news.content}
							<p class="ml-6 text-sm whitespace-pre-line text-gray-700">{news.content}</p>
						{:else}
							<p class="text-muted-foreground ml-6 text-sm italic">Aucun contenu</p>
						{/if}
					</SectionCard>
				</section>

				<Separator />

				<!-- media -->
				<!-- media -->
				<SectionCard
					icon={NEWS_SECTION_CONFIG.media.icon}
					title={NEWS_SECTION_CONFIG.media.label}
					color={NEWS_SECTION_CONFIG.media.color}
				>
					{#if news.mediaUrl}
						{#if news.mediaUrl.endsWith('.pdf')}
							<!-- 📄 PDF -->
							<div>
								<object
									data={news.mediaUrl}
									type="application/pdf"
									class="h-200 w-full rounded-lg border border-gray-200"
									aria-label="PDF viewer"
								>
									<p class="text-muted-foreground text-sm">
										Impossible d'afficher le PDF. <a
											href={news.mediaUrl}
											target="_blank"
											class="underline">Télécharger</a
										>
									</p>
								</object>
							</div>
						{:else if news.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)}
							<!-- 🖼️ IMAGE -->
							<div class="overflow-hidden rounded-lg">
								<img src={news.mediaUrl} alt="Media" class="h-full w-full object-cover" />
							</div>
						{:else}
							<!-- 🔗 LIEN GÉNÉRIQUE -->
							<a
								href={news.mediaUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="ml-6 block text-sm text-blue-600 underline hover:text-blue-800"
							>
								{news.mediaUrl}
							</a>
						{/if}
					{:else}
						<p class="text-muted-foreground ml-6 text-sm italic">Aucun média</p>
					{/if}
				</SectionCard>
			</Card.Content>
		{:else}
			<Card.Content class="grid grid-cols-1 gap-6">
				<!-- ===== MODE ÉDITION ===== -->
				<NewsEditForm
					bind:editData
					newsId={news.id}
					{cats}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="news" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez une news</p>
		</Card.Content>
	</Card.Root>
{/if}
