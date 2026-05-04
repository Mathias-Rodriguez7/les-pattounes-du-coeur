<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { News } from '$lib/types/news';

	let { selectedNews }: { selectedNews: News | null } = $props();
</script>

<Dialog.Content size="xl">
	{#if selectedNews}
		<Dialog.Header class="flex justify-between">
			<div>
				<Dialog.Title>{selectedNews.title}</Dialog.Title>
				<p class="text-sm opacity-70">{selectedNews.formattedDate}</p>
			</div>
		</Dialog.Header>

		<div class="mt-4">
			{#if selectedNews.mediaUrl}
				<object
					data={selectedNews.mediaUrl}
					type="application/pdf"
					class="h-[70vh] w-full rounded-lg border"
					aria-label="pdf"
				>
				</object>
			{:else}
				<p class="whitespace-pre-line">
					{selectedNews.content}
				</p>
			{/if}
		</div>
	{/if}
</Dialog.Content>
