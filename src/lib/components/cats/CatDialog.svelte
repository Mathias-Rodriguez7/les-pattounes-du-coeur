<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import type { Cat } from '$lib/types/cat';
	import { Button } from '$lib/components/ui/button/index.js';
	import SexIcon from '$lib/components/cats/SexIcon.svelte';
	import { focalPointClass } from '$lib/utils/catHelpers';

	let { selectedCat }: { selectedCat: Cat | null } = $props();

	let currentPhoto = $state(0);

	$effect(() => {
		if (selectedCat) currentPhoto = 0;
	});
</script>

<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
	{#if selectedCat}
		<Dialog.Header>
			<Dialog.Title class="text-xl">{selectedCat.name}</Dialog.Title>
			<div class="text-muted-foreground flex gap-2 text-sm">
				<span class="flex gap-2">
					<SexIcon sex={selectedCat.sex} class="size-4" />
					{selectedCat.formattedAge}
				</span>
			</div>
		</Dialog.Header>

		<!-- GALERIE -->
		{#if selectedCat.media.length > 0}
			<div class="relative overflow-hidden rounded-2xl">
				<img
					src={selectedCat.media[currentPhoto]?.picture ?? '/img/placeholder.jpg'}
					class="h-72 w-full object-cover {focalPointClass[selectedCat.focalPoint ?? 'MID']}"
					alt={selectedCat.name ?? 'Chat'}
				/>

				{#if selectedCat.media.length > 1}
					<!-- Miniatures -->
					<div class="mt-2 flex gap-2 overflow-x-auto">
						{#each selectedCat.media as m, i (i)}
							<button
								type="button"
								onclick={() => (currentPhoto = i)}
								class="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all {i ===
								currentPhoto
									? 'border-primary'
									: 'border-transparent opacity-60 hover:opacity-100'}"
							>
								<img src={m.picture} class="h-full w-full object-cover" alt="" />
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- BADGES COMPATIBILITÉ -->
		<div class="flex flex-wrap gap-2">
			{#if selectedCat.isOkDog}
				<Badge variant="soft">OK chien</Badge>
			{/if}
			{#if selectedCat.isOkCat}
				<Badge variant="soft">OK chat</Badge>
			{/if}
			{#if selectedCat.isOkChild}
				<Badge variant="soft">OK enfant</Badge>
			{/if}
			{#if selectedCat.isOutside}
				<Badge variant="soft">Accès extérieur</Badge>
			{/if}
		</div>

		<!-- DESCRIPTION -->
		{#if selectedCat.description}
			<p class="text-muted-foreground text-sm leading-relaxed">
				{selectedCat.description}
			</p>
		{/if}

		<Dialog.Footer class="sm:justify-end">
			<Button href={`/adoptions/chat/${selectedCat.id}`}>Offrir un foyer</Button>
		</Dialog.Footer>
	{/if}
</Dialog.Content>
