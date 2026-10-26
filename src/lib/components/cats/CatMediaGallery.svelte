<script lang="ts">
	import type { MediaCat } from '@prisma/client';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ImagePlus, Video, FileText, Trash, X } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	type MediaKind = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

	type Props = {
		catId: string;
		catName?: string | null;
		media: MediaCat[];
		onChange: (media: MediaCat[]) => void;
		onClose?: () => void;
	};

	let { catId, catName, media, onChange, onClose }: Props = $props();

	let imageInput: HTMLInputElement;
	let videoInput: HTMLInputElement;
	let documentInput: HTMLInputElement;

	// Découpage par type
	const images = $derived(media.filter((m) => m.type === 'IMAGE'));
	const videos = $derived(media.filter((m) => m.type === 'VIDEO'));
	const documents = $derived(media.filter((m) => m.type === 'DOCUMENT'));

	// Photo principale : parmi les images, celle marquée isPrimary, sinon la première
	const primary = $derived(images.find((m) => m.isPrimary) ?? images[0] ?? null);
	const otherImages = $derived(images.filter((m) => m.id !== primary?.id));

	const focalStyle = (m: MediaCat) => `object-position: ${m.focalPointX}% ${m.focalPointY}%`;

	const uploadFiles = async (files: File[], kind: MediaKind) => {
		if (!files.length) return;

		const formData = new FormData();
		formData.append('type', kind);
		files.forEach((f) => formData.append('files', f));

		const res = await fetch(`/api/cats/${catId}/media`, {
			method: 'POST',
			body: formData
		});

		if (res.ok) {
			const newMedia: MediaCat[] = await res.json();
			onChange([...media, ...newMedia]);
		}
	};

	const handleInput = (kind: MediaKind) => async (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		await uploadFiles(files, kind);
		input.value = '';
	};

	const setPrimary = async (item: MediaCat) => {
		if (item.isPrimary) return;

		const res = await fetch(`/api/cats/${catId}/media/${item.id}/primary`, {
			method: 'PATCH'
		});

		if (res.ok) {
			onChange(await res.json());
		}
	};

	const handleDelete = async (item: MediaCat) => {
		if (!confirm('Supprimer ce fichier ?')) return;

		const res = await fetch(`/api/cats/${catId}/media/${item.id}`, {
			method: 'DELETE'
		});

		if (res.ok) {
			onChange(media.filter((m) => m.id !== item.id));
		}
	};
</script>

<div class="space-y-8">
	<!-- Inputs cachés -->
	<input
		bind:this={imageInput}
		type="file"
		accept="image/*"
		multiple
		class="hidden"
		onchange={handleInput('IMAGE')}
	/>
	<input
		bind:this={videoInput}
		type="file"
		accept="video/*"
		class="hidden"
		onchange={handleInput('VIDEO')}
	/>
	<input
		bind:this={documentInput}
		type="file"
		accept="application/pdf"
		multiple
		class="hidden"
		onchange={handleInput('DOCUMENT')}
	/>

	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">
			Éditer le chat: {catName || 'Sans nom'}
		</h2>
		{#if onClose}
			<Button variant="ghost" onclick={onClose}><X class="h-5 w-5" /></Button>
		{/if}
	</div>

	<!-- ================= IMAGES ================= -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Photos ({images.length})</h3>
			<Button variant="outline" onclick={() => imageInput.click()}>
				<ImagePlus class="mr-2 h-4 w-4" />
				Ajouter une photo
			</Button>
		</div>

		{#if images.length === 0}
			<div
				class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
			>
				Aucune photo
			</div>
		{:else}
			<div class="grid auto-rows-40 grid-cols-5 gap-3">
				{#if primary}
					<div class="group relative col-span-2 row-span-2 overflow-hidden rounded-xl">
						<img
							src={primary.url}
							alt={primary.originalName ?? 'Photo principale'}
							class="h-full w-full object-cover"
							style={focalStyle(primary)}
						/>
						<span class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
							Principale
						</span>
						<button
							type="button"
							onclick={() => handleDelete(primary)}
							class="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100"
							aria-label="Supprimer la photo"
						>
							<Trash class="h-4 w-4" />
						</button>
					</div>
				{/if}

				{#each otherImages as item (item.id)}
					<div
						role="button"
						tabindex="0"
						onclick={() => setPrimary(item)}
						onkeydown={(e) => e.key === 'Enter' && setPrimary(item)}
						class="group relative cursor-pointer overflow-hidden rounded-xl"
						title="Cliquer pour définir comme photo principale"
					>
						<img
							src={item.url}
							alt={item.originalName ?? 'Photo'}
							class="h-full w-full object-cover transition group-hover:scale-105"
							style={focalStyle(item)}
						/>

						<div
							class="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100"
						>
							Mettre en principale
						</div>

						<button
							type="button"
							onclick={(e) => {
								e.stopPropagation();
								handleDelete(item);
							}}
							class="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100"
							aria-label="Supprimer la photo"
						>
							<Trash class="h-4 w-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<Separator />

	<!-- ================= VIDÉOS ================= -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Vidéos ({videos.length})</h3>
			<Button variant="outline" onclick={() => videoInput.click()}>
				<Video class="mr-2 h-4 w-4" />
				Ajouter une vidéo
			</Button>
		</div>

		{#if videos.length === 0}
			<div
				class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
			>
				Aucune vidéo
			</div>
		{:else}
			<div class="grid grid-cols-3 gap-3">
				{#each videos as item (item.id)}
					<div class="group relative overflow-hidden rounded-xl bg-black">
						<video src={item.url} controls preload="metadata" class="h-full w-full object-contain">
							<track kind="captions" srclang="fr" label="Français" />
						</video>
						<button
							type="button"
							onclick={() => handleDelete(item)}
							class="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100"
							aria-label="Supprimer la vidéo"
						>
							<Trash class="h-4 w-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<Separator />

	<!-- ================= DOCUMENTS ================= -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Documents ({documents.length})</h3>
			<Button variant="outline" onclick={() => documentInput.click()}>
				<FileText class="mr-2 h-4 w-4" />
				Ajouter un document
			</Button>
		</div>

		{#if documents.length === 0}
			<div
				class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
			>
				Aucun document
			</div>
		{:else}
			<ul>
				{#each documents as item (item.id)}
					<li class="flex items-center justify-between gap-4 border-b p-3 last:border-b-0">
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-3 hover:underline"
						>
							<FileText class="h-5 w-5 text-red-500" />
							<span class="truncate">{item.originalName ?? 'Document PDF'}</span>
						</a>
						<button
							type="button"
							onclick={() => handleDelete(item)}
							class="text-muted-foreground hover:text-destructive p-2"
							aria-label="Supprimer le document"
						>
							<Trash class="h-4 w-4" />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
