<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import type { Cat } from '$lib/types/cat';
	import { Button } from '$lib/components/ui/button/index.js';

	let { selectedCat } = $props<{ selectedCat: Cat | null }>();
</script>

{#if selectedCat}
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{selectedCat.name}</Dialog.Title>
		</Dialog.Header>
		<div class="flex h-100 justify-center overflow-hidden rounded-2xl">
			<img
				src={selectedCat.media?.[0]?.picture ?? '/img/placeholder.jpg'}
				class="w-full object-cover"
				alt="cat"
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

		<Dialog.Description
			>{selectedCat.description} Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel officiis
			quam cupiditate recusandae eligendi, ad, aliquid numquam explicabo iure pariatur distinctio tempore
			beatae. Quas necessitatibus nam maxime reprehenderit quod adipisci. Lorem ipsum dolor sit amet consectetur
			adipisicing elit. Alias debitis, nulla illum quia odio fugit voluptatum delectus praesentium ducimus
			laborum repellendus a et quos officia eaque doloremque atque! Ex, delectus.</Dialog.Description
		>

		<Dialog.Footer class="sm:justify-end">
			<Button>Offrir un foyer</Button>
		</Dialog.Footer>
	</Dialog.Content>
{/if}
