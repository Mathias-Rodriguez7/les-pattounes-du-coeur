<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import { Pencil, FileText } from '@lucide/svelte';
	import { getGradientStyle } from '$lib/utils/iconThemes';
	import { formatDate } from '$lib/utils/date';
	import SectionCard from '../cards/SectionCard.svelte';
	import NewsEditForm from './NewsEditForm.svelte';
	import NewsCatsPanel from './NewsCatsPanel.svelte';
	import { NEWS_SECTION_CONFIG, NEWS_TYPE_CONFIG } from '$lib/constants/news';
	import type { NewsFull, NewsEditData } from '$lib/types/news';

	interface Props {
		news: NewsFull | null;
		cats?: { id: string; name: string | null; catNumber: string }[];
		canEdit?: boolean;
		canDelete?: boolean;
	}

	const { news, cats = [], canEdit = false, canDelete = false }: Props = $props();

	let isEditing = $state(false);

	let editData = $state<NewsEditData>({
		title: '',
		content: '',
		type: 'NEWS',
		mediaUrl: '',
		catIds: []
	});

	// Quand on sélectionne une autre news, on quitte le mode édition
	$effect(() => {
		void news?.id; // on "lit" l'id pour que l'effet se relance quand il change
		isEditing = false;
	});

	function startEditing() {
		if (!news) return;
		editData = {
			title: news.title,
			content: news.content ?? '',
			type: news.type,
			mediaUrl: news.mediaUrl ?? '',
			catIds: news.cats.map((cat) => cat.id) // les chats sont déjà aplatis par le load
		};
		isEditing = true;
	}

	// Les données à jour arrivent via update() dans NewsEditForm : on ne touche pas à la prop
	const handleSuccessfulSave = () => (isEditing = false);
	const handleCancelEdit = () => (isEditing = false);

	const currentType = $derived(
		news?.type && news.type in NEWS_TYPE_CONFIG
			? NEWS_TYPE_CONFIG[news.type]
			: NEWS_TYPE_CONFIG.NEWS
	);

	const isPdf = $derived(!!news?.mediaUrl && /\.pdf$/i.test(news.mediaUrl));
	const isImage = $derived(!!news?.mediaUrl && /\.(jpe?g|png|gif|webp)$/i.test(news.mediaUrl));
</script>

{#if news}
	<Card.Root class="flex h-full flex-col">
		{#if !isEditing}
			<!-- ===== HEADER ===== -->
			<Card.Header>
				<div class="flex justify-between gap-2 lg:h-25">
					<div class="flex min-w-0 gap-4 lg:gap-8">
						<!-- Icône + type -->
						<div class="flex shrink-0 flex-col items-center justify-around gap-2">
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
						<div class="flex min-w-0 flex-col justify-around gap-1">
							<Card.Title class="text-lg wrap-break-word sm:text-xl lg:text-2xl">
								{news.title}
							</Card.Title>
							<Card.Description class="text-sm sm:text-base lg:text-xl">
								{formatDate(new Date(news.createdAt))}
							</Card.Description>
						</div>
					</div>

					{#if canEdit}
						<div class="shrink-0">
							<Button
								variant="ghost"
								size="icon"
								onclick={startEditing}
								aria-label="Modifier la news"
							>
								<Pencil class="h-5 w-5" />
							</Button>
						</div>
					{/if}
				</div>
			</Card.Header>

			<!-- ===== CONTENU ===== -->
			<Card.Content class="grid grid-cols-1 gap-6">
				<Separator />

				<section>
					<SectionCard
						icon={NEWS_SECTION_CONFIG.content.icon}
						title={NEWS_SECTION_CONFIG.content.label}
						color={NEWS_SECTION_CONFIG.content.color}
					>
						{#if news.content}
							<p class="text-sm wrap-break-word whitespace-pre-line text-gray-700 sm:ml-6">
								{news.content}
							</p>
						{:else}
							<p class="text-muted-foreground text-sm italic sm:ml-6">Aucun contenu</p>
						{/if}
					</SectionCard>
				</section>

				<Separator />

				{#if news.type === 'NEWSCATS'}
					<NewsCatsPanel cats={news.cats} />
				{:else}
					<SectionCard
						icon={NEWS_SECTION_CONFIG.media.icon}
						title={NEWS_SECTION_CONFIG.media.label}
						color={NEWS_SECTION_CONFIG.media.color}
					>
						{#if news.mediaUrl}
							{#if isPdf}
								<!-- PC : lecteur intégré -->
								<object
									data={news.mediaUrl}
									type="application/pdf"
									class="hidden h-200 w-full rounded-lg border border-gray-200 lg:block"
									aria-label="Lecteur PDF"
								>
									<p class="text-muted-foreground text-sm">
										Impossible d'afficher le PDF.
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- lien vers un média/externe, pas une route -->
										<a
											href={news.mediaUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="underline">Télécharger</a
										>
									</p>
								</object>

								<!-- Mobile : les navigateurs affichent mal les PDF intégrés -->
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- lien vers un média/externe, pas une route -->
								<a
									href={news.mediaUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="{buttonVariants({ variant: 'outline' })} w-full lg:hidden"
								>
									<FileText class="h-4 w-4" />
									Ouvrir le PDF
								</a>
							{:else if isImage}
								<div class="overflow-hidden rounded-lg">
									<img src={news.mediaUrl} alt={news.title} class="h-full w-full object-cover" />
								</div>
							{:else}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- lien vers un média/externe, pas une route -->
								<a
									href={news.mediaUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="block text-sm break-all text-blue-600 underline hover:text-blue-800 sm:ml-6"
								>
									{news.mediaUrl}
								</a>
							{/if}
						{:else}
							<p class="text-muted-foreground text-sm italic sm:ml-6">Aucun média</p>
						{/if}
					</SectionCard>
				{/if}
			</Card.Content>
		{:else}
			<!-- ===== MODE ÉDITION ===== -->
			<Card.Content class="grid grid-cols-1 gap-6">
				<NewsEditForm
					bind:editData
					newsId={news.id}
					{cats}
					{canDelete}
					onSuccess={handleSuccessfulSave}
					onCancel={handleCancelEdit}
				/>
			</Card.Content>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-muted-foreground text-center">
			<Icon name="news" class="mx-auto mb-2 h-8 w-8 opacity-50" />
			<p class="text-sm">Sélectionnez une news</p>
		</Card.Content>
	</Card.Root>
{/if}
