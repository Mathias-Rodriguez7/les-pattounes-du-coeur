<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { NewsFull } from '$lib/types/news';
	import NewsCatDialog from '$lib/components/news/NewsCatDialog.svelte';
	import { formatDate } from '$lib/utils/date';
	import DocumentPreview from '$lib/components/media/DocumentPreview.svelte';

	let { selectedNews }: { selectedNews: NewsFull | null } = $props();

	const pdf = $derived(
		selectedNews?.mediaFile
			? {
					src: selectedNews.mediaFile.url,
					name: selectedNews.mediaFile.name,
					sizeBytes: selectedNews.mediaFile.sizeBytes,
					mimeType: selectedNews.mediaFile.mimeType
				}
			: selectedNews?.mediaUrl
				? { src: selectedNews.mediaUrl, name: null, sizeBytes: null, mimeType: null }
				: null
	);
</script>

<Dialog.Content size="xl" class="bg-background">
	{#if selectedNews}
		<div>
			<!-- 🐱 MODE NEWSCATS -->
			{#if selectedNews.type === 'NEWSCATS'}
				<NewsCatDialog news={selectedNews} cats={selectedNews.cats} />
				<!-- 📄 MODE PDF -->
			{:else if pdf}
				<Dialog.Header class="flex justify-between p-6">
					<div class="flex justify-between">
						<Dialog.Title>{selectedNews.title}</Dialog.Title>
						<p class="text-sm opacity-70">{formatDate(selectedNews.createdAt)}</p>
					</div>
				</Dialog.Header>

				<!-- PC : lecteur intégré ; mobile : une carte qui ouvre la visionneuse du téléphone -->
				<DocumentPreview
					variant="embed"
					src={pdf.src}
					name={pdf.name ?? selectedNews.title}
					sizeBytes={pdf.sizeBytes}
					mimeType={pdf.mimeType}
				/>

				<!-- 📝 MODE TEXTE -->
			{:else}
				<p class="whitespace-pre-line">
					{selectedNews.content}
				</p>
			{/if}
		</div>
	{/if}
</Dialog.Content>
