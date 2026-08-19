<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Upload, Trash2, GripVertical, Focus, X, Loader2 } from '@lucide/svelte';
	import type { CatFull, CatMedia } from '$lib/types/cat';
	import { enhance } from '$app/forms';

	interface Props {
		open: boolean;
		cat: CatFull;
		onClose: () => void;
	}

	let { open = $bindable(), cat, onClose }: Props = $props();

	let uploading = $state(false);
	let medias = $state<CatMedia[]>(cat.medias || []);
	let draggedItem: CatMedia | null = $state(null);
	let selectedMediaForFocus: CatMedia | null = $state(null);
	let focusDialogOpen = $state(false);

	function handleDragStart(e: DragEvent, media: CatMedia) {
		draggedItem = media;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(e: DragEvent, targetMedia: CatMedia) {
		e.preventDefault();
		if (!draggedItem) return;

		const draggedIndex = medias.indexOf(draggedItem);
		const targetIndex = medias.indexOf(targetMedia);

		if (draggedIndex !== targetIndex) {
			const newMedias = [...medias];
			newMedias.splice(draggedIndex, 1);
			newMedias.splice(targetIndex, 0, draggedItem);

			// Mettre à jour l'ordre
			medias = newMedias.map((m, i) => ({ ...m, order: i }));
		}

		draggedItem = null;
	}

	function removeMedia(media: CatMedia) {
		medias = medias.filter((m) => m.id !== media.id);
	}

	async function handleFileUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;

		if (!files) return;

		uploading = true;

		for (const file of files) {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('catId', cat.id);

			try {
				const response = await fetch('/api/media/upload', {
					method: 'POST',
					body: formData
				});

				if (response.ok) {
					const newMedia = await response.json();
					medias = [...medias, newMedia];
				}
			} catch (error) {
				console.error('Upload failed:', error);
			}
		}

		uploading = false;
		target.value = '';
	}

	async function saveChanges() {
		try {
			const response = await fetch('/api/media/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					catId: cat.id,
					medias: medias.map((m, i) => ({
						id: m.id,
						order: i,
						focalPointX: m.focalPointX,
						focalPointY: m.focalPointY
					}))
				})
			});

			if (response.ok) {
				onClose();
				open = false;
			}
		} catch (error) {
			console.error('Save failed:', error);
		}
	}

	async function deleteMedia(mediaId: string) {
		try {
			const response = await fetch('/api/media/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: mediaId })
			});

			if (response.ok) {
				removeMedia(medias.find((m) => m.id === mediaId)!);
			}
		} catch (error) {
			console.error('Delete failed:', error);
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex max-h-[90vh] max-w-2xl flex-col">
		<Dialog.Header>
			<Dialog.Title>Gérer les photos de {cat.name}</Dialog.Title>
			<Dialog.Description>
				Réorganisez, supprimez ou ajoutez des photos. Vous pouvez aussi définir le point focal.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex-1 overflow-y-auto">
			<!-- Zone d'upload -->
			<div class="bg-muted/30 mb-6 rounded-lg border-2 border-dashed p-4">
				<label for="media-upload" class="flex cursor-pointer flex-col items-center gap-2">
					<Upload class="text-muted-foreground h-6 w-6" />
					<span class="text-muted-foreground text-sm"> Cliquez ou déposez des fichiers ici </span>
					<Input
						id="media-upload"
						type="file"
						multiple
						accept="image/*,.pdf"
						onchange={handleFileUpload}
						disabled={uploading}
						class="hidden"
					/>
				</label>
				{#if uploading}
					<div class="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
						<Loader2 class="h-4 w-4 animate-spin" />
						Upload en cours...
					</div>
				{/if}
			</div>

			<!-- Liste des médias -->
			<div class="space-y-2">
				{#if medias.length === 0}
					<div class="text-muted-foreground py-8 text-center text-sm">
						Aucune photo pour le moment. Ajoutez-en une ci-dessus.
					</div>
				{:else}
					{#each medias as media (media.id)}
						<div
							class="bg-card hover:bg-accent flex items-center gap-3 rounded-lg border p-3 transition-colors"
							draggable="true"
							ondragstart={(e) => handleDragStart(e, media)}
							ondragover={handleDragOver}
							ondrop={(e) => handleDrop(e, media)}
						>
							<!-- Drag handle -->
							<GripVertical class="text-muted-foreground h-5 w-5 flex-shrink-0 cursor-grab" />

							<!-- Preview -->
							<div class="bg-muted h-16 w-16 flex-shrink-0 overflow-hidden rounded border">
								{#if media.type === 'image'}
									<img src={media.url} alt={media.name} class="h-full w-full object-cover" />
								{:else}
									<div class="flex h-full items-center justify-center">
										<span class="text-muted-foreground text-xs">PDF</span>
									</div>
								{/if}
							</div>

							<!-- Info -->
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{media.name}</p>
								<p class="text-muted-foreground text-xs">
									{(media.size / 1024 / 1024).toFixed(2)} MB
								</p>
							</div>

							<!-- Actions -->
							<div class="flex flex-shrink-0 gap-2">
								{#if media.type === 'image'}
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											selectedMediaForFocus = media;
											focusDialogOpen = true;
										}}
									>
										<Focus class="h-4 w-4" />
									</Button>
								{/if}
								<Button variant="destructive" size="sm" onclick={() => deleteMedia(media.id)}>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Footer -->
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Annuler</Button>
			<Button onclick={saveChanges} disabled={uploading}>Sauvegarder</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Focus Point Dialog -->
<FocusPointDialog
	bind:open={focusDialogOpen}
	media={selectedMediaForFocus}
	onSave={(x, y) => {
		if (selectedMediaForFocus) {
			const index = medias.findIndex((m) => m.id === selectedMediaForFocus?.id);
			if (index !== -1) {
				medias[index] = {
					...medias[index],
					focalPointX: x,
					focalPointY: y
				};
			}
		}
		focusDialogOpen = false;
	}}
/>
