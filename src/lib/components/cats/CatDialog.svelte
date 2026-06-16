<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import type { Cat } from '$lib/types/cat';
	import { Button } from '$lib/components/ui/button/index.js';

	let { selectedCat } = $props<{ selectedCat: Cat | null }>();
</script>

<Dialog.Content>
	{#if selectedCat}
		<Dialog.Header>
			<Dialog.Title>{selectedCat.name}</Dialog.Title>
		</Dialog.Header>

		<div class="flex h-100 justify-center overflow-hidden rounded-2xl">
			<img
				src={selectedCat.media?.[0]?.picture ?? '/img/placeholder.jpg'}
				class="w-full object-cover"
				alt={selectedCat.name}
			/>
		</div>

		<div class="mt-4 flex flex-wrap gap-2">
			{#if selectedCat.isOkDog}
				<Badge class="bg-accent text-foreground">OK chien</Badge>
			{/if}

			{#if selectedCat.isOkCat}
				<Badge class="bg-accent text-foreground">OK chat</Badge>
			{/if}

			{#if selectedCat.isOkChild}
				<Badge class="bg-accent text-foreground">OK enfant</Badge>
			{/if}
		</div>

		<Dialog.Description>
			{selectedCat.description}
		</Dialog.Description>

		<Dialog.Footer class="sm:justify-end">
			<Button href={`/adoptions/chat/${selectedCat.id}`}>Offrir un foyer</Button>
		</Dialog.Footer>
	{/if}
</Dialog.Content>
