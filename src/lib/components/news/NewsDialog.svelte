<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { NewsFull } from '$lib/types/news';
	import NewsCatDialog from '$lib/components/news/NewsCatDialog.svelte';
	import { formatDate } from '$lib/utils/date';

	let { selectedNews }: { selectedNews: NewsFull | null } = $props();
</script>

<Dialog.Content size="xl" class="bg-background">
	{#if selectedNews}
		<div>
			<!-- 🐱 MODE NEWSCATS -->
			{#if selectedNews.type === 'NEWSCATS'}
				<NewsCatDialog {selectedNews} cats={selectedNews.cats} />

				<!-- 📄 MODE PDF -->
			{:else if selectedNews.mediaUrl}
				<Dialog.Header class="flex justify-between p-6">
					<div class="flex justify-between">
						<Dialog.Title>{selectedNews.title}</Dialog.Title>
						<p class="text-sm opacity-70">{formatDate(selectedNews.createdAt)}</p>
					</div>
				</Dialog.Header>

				<object
					data={selectedNews.mediaUrl}
					type="application/pdf"
					class="h-[70vh] w-full rounded-lg border"
					aria-label="pdf"
				></object>

				<!-- 📝 MODE TEXTE -->
			{:else}
				<p class="whitespace-pre-line">
					{selectedNews.content}
				</p>
			{/if}
		</div>
	{/if}
</Dialog.Content>
