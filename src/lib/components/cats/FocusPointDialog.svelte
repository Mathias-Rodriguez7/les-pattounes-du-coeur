<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import type { CatMedia } from '$lib/types/cat';

	interface Props {
		open: boolean;
		media: CatMedia | null;
		onSave: (x: number, y: number) => void;
	}

	let { open = $bindable(), media, onSave }: Props = $props();

	let focusX = $state(0.5);
	let focusY = $state(0.5);
	let containerRef: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (media) {
			focusX = media.focalPointX || 0.5;
			focusY = media.focalPointY || 0.5;
		}
	});

	function handleImageClick(e: MouseEvent) {
		if (!containerRef) return;

		const rect = containerRef.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;

		focusX = Math.max(0, Math.min(1, x));
		focusY = Math.max(0, Math.min(1, y));
	}

	function handleSave() {
		onSave(focusX, focusY);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Définir le point focal</Dialog.Title>
			<Dialog.Description>
				Cliquez sur l'image pour définir le point focal (utilisé pour les miniatures)
			</Dialog.Description>
		</Dialog.Header>

		{#if media}
			<div class="space-y-4">
				<!-- Image avec crosshair -->
				<div
					bind:this={containerRef}
					class="bg-muted relative w-full cursor-crosshair overflow-hidden rounded"
					style="aspect-ratio: 4/3"
					onclick={handleImageClick}
				>
					<img src={media.url} alt={media.name} class="h-full w-full object-cover" />

					<!-- Crosshair au focus point -->
					<div
						class="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-red-500"
						style="left: {focusX * 100}%; top: {focusY * 100}%"
					>
						<div
							class="absolute top-1/2 left-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 transform bg-red-500"
						/>
						<div
							class="absolute top-1/2 left-1/2 h-0.5 w-8 -translate-x-1/2 -translate-y-1/2 transform bg-red-500"
						/>
					</div>
				</div>

				<!-- Coordonnées -->
				<div class="text-muted-foreground text-center text-xs">
					Focus: {(focusX * 100).toFixed(0)}% × {(focusY * 100).toFixed(0)}%
				</div>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
			<Button onclick={handleSave}>Confirmer</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
