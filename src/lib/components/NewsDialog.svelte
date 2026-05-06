<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { News } from '$lib/types/news';
	import NewsCatDialog from '$lib/components/NewsCatDialog.svelte';

	let { selectedNews }: { selectedNews: News | null } = $props();
</script>

<Dialog.Content size="xl" class="bg-background">
	{#if selectedNews}
		<Dialog.Header class="flex justify-between p-6">
			<div class=" flex justify-between">
				<Dialog.Title>{selectedNews.title}</Dialog.Title>
				<p class="text-sm opacity-70">{selectedNews.formattedDate}</p>
			</div>
		</Dialog.Header>

		<div class="">
			<!-- 🐱 MODE NEWSCATS -->
			{#if selectedNews.type === 'NEWSCATS'}
				<NewsCatDialog cats={selectedNews.cats} />

				<!-- 📄 MODE PDF -->
			{:else if selectedNews.mediaUrl}
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
