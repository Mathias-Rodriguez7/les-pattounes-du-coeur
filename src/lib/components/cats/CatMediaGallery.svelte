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

	<div class="flex items-center justify-between gap-2">
		<h2 class="min-w-0 truncate text-lg font-semibold">
			Médias : {catName || 'Sans nom'}
		</h2>
		{#if onClose}
			<Button
				variant="ghost"
				size="icon"
				class="shrink-0"
				onclick={onClose}
				aria-label="Fermer les médias"
			>
				<X class="h-5 w-5" />
			</Button>
		{/if}
	</div>

	<!-- ================= PHOTOS ================= -->
	<section class="space-y-4">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-lg font-semibold">Photos ({images.length})</h3>
			<Button variant="outline" onclick={() => imageInput.click()}>
				<ImagePlus class="h-4 w-4" />
				<span class="hidden sm:inline">Ajouter une photo</span>
				<span class="sm:hidden">Ajouter</span>
			</Button>
		</div>

		{#if images.length === 0}
			<div
				class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
			>
				Aucune photo
			</div>
		{:else}
			<!-- PC : 5 colonnes de 160 px de haut (comme avant) | Mobile : 3 colonnes de carrés -->
			<div class="grid grid-cols-3 gap-2 sm:gap-3 lg:auto-rows-40 lg:grid-cols-5">
				{#if primary}
					<div
						class="group relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-xl lg:aspect-auto"
					>
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
							class="absolute top-2 right-2 rounded-full bg-black/60 p-2.5 text-white transition pointer-fine:p-2 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
							aria-label="Supprimer la photo principale"
						>
							<Trash class="h-4 w-4" />
						</button>
					</div>
				{/if}

				{#each otherImages as item (item.id)}
					<div class="group relative aspect-square overflow-hidden rounded-xl lg:aspect-auto">
						<!-- Clic sur la photo = la mettre en principale -->
						<button
							type="button"
							onclick={() => setPrimary(item)}
							class="block h-full w-full cursor-pointer"
							title="Définir comme photo principale"
							aria-label="Définir comme photo principale"
						>
							<img
								src={item.url}
								alt={item.originalName ?? 'Photo'}
								loading="lazy"
								class="h-full w-full object-cover transition pointer-fine:group-hover:scale-105"
								style={focalStyle(item)}
							/>
						</button>

						<!-- Souris : indication au survol | Tactile : petite étoile toujours visible -->
						<div
							class="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/40 text-sm font-medium text-white opacity-0 transition pointer-fine:flex pointer-fine:group-hover:opacity-100"
						>
							Mettre en principale
						</div>
						<span
							class="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white pointer-fine:hidden"
						>
							☆ Principale
						</span>

						<button
							type="button"
							onclick={() => handleDelete(item)}
							class="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/60 p-2 text-white transition pointer-fine:top-2 pointer-fine:right-2 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
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
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-lg font-semibold">Vidéos ({videos.length})</h3>
			<Button variant="outline" onclick={() => videoInput.click()}>
				<Video class="h-4 w-4" />
				<span class="hidden sm:inline">Ajouter une vidéo</span>
				<span class="sm:hidden">Ajouter</span>
			</Button>
		</div>

		{#if videos.length === 0}
			<div
				class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
			>
				Aucune vidéo
			</div>
		{:else}
			<!-- PC : 3 colonnes (comme avant) | Tablette : 2 | Mobile : 1 -->
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each videos as item (item.id)}
					<div class="group relative overflow-hidden rounded-xl bg-black">
						<video src={item.url} controls preload="metadata" class="h-full w-full object-contain">
							<track kind="captions" srclang="fr" label="Français" />
						</video>
						<button
							type="button"
							onclick={() => handleDelete(item)}
							class="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white transition pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100"
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
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-lg font-semibold">Documents ({documents.length})</h3>
			<Button variant="outline" onclick={() => documentInput.click()}>
				<FileText class="h-4 w-4" />
				<span class="hidden sm:inline">Ajouter un document</span>
				<span class="sm:hidden">Ajouter</span>
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
							class="flex min-w-0 items-center gap-3 hover:underline"
						>
							<FileText class="h-5 w-5 shrink-0 text-red-500" />
							<span class="truncate">{item.originalName ?? 'Document PDF'}</span>
						</a>
						<button
							type="button"
							onclick={() => handleDelete(item)}
							class="text-muted-foreground hover:text-destructive shrink-0 p-2"
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
