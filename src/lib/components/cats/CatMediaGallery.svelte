<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { X, Star, Crosshair, LoaderCircle } from '@lucide/svelte';
	import MediaUpload from '../media/MediaUpload.svelte';
	import VideoPreview from '../media/VideoPreview.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import FocusPointDialog from './FocusPointDialog.svelte';
	import { publicMediaUrl } from '$lib/media/urls';
	import { uploadFile, fileKey, UploadError } from '$lib/media/upload';
	import { focalPointStyle } from '$lib/utils/catHelpers';
	import type { CatFull } from '$lib/types/cat';

	type GalleryItem = CatFull['media'][number];

	interface Props {
		cat: CatFull;
		onClose?: () => void;
	}

	let { cat, onClose }: Props = $props();

	const MAX_FILES = 10;
	const catLabel = $derived(cat.name ?? cat.catNumber);

	// La requête trie déjà : photo principale d'abord, puis par ordre d'ajout
	const images = $derived(cat.media.filter((m) => m.file.type === 'IMAGE'));
	const videos = $derived(cat.media.filter((m) => m.file.type === 'VIDEO'));
	const primary = $derived(images.find((m) => m.isPrimary) ?? images[0] ?? null);
	const otherImages = $derived(images.filter((m) => m.id !== primary?.id));

	// ===== ENVOI =====
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});
	let uploading = $state(false);

	const handleUpload: SubmitFunction = async ({ formData, cancel }) => {
		if (files.length === 0) {
			cancel();
			return;
		}
		uploading = true;

		try {
			for (const file of files) {
				const uploaded = await uploadFile(file, {
					purpose: 'catGallery',
					targetId: cat.id,
					onProgress: (percent) => (progress = { ...progress, [fileKey(file)]: percent })
				});
				formData.append('mediaStorageKey', uploaded.storageKey);
				formData.append('mediaOriginalName', uploaded.originalName);
			}
		} catch (e) {
			uploading = false;
			progress = {};
			toast.error(e instanceof UploadError ? e.message : "Échec de l'envoi d'un fichier");
			cancel();
			return;
		}

		return async ({ result, update }) => {
			uploading = false;
			progress = {};
			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Fichiers ajoutés');
				files = [];
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? "Erreur lors de l'ajout");
			}
			await update();
		};
	};

	// ===== PETITES ACTIONS (photo principale) =====
	const quickAction =
		(successMessage: string): SubmitFunction =>
		() =>
		async ({ result, update }) => {
			if (result.type === 'success') toast.success(successMessage);
			else if (result.type === 'failure')
				toast.error((result.data?.error as string) ?? 'Action impossible');
			await update();
		};

	// ===== CADRAGE =====
	let focalOpen = $state(false);
	let focalItem = $state<GalleryItem | null>(null);

	const focalMedia = $derived(
		focalItem
			? {
					id: focalItem.id,
					url: publicMediaUrl(focalItem.file.storageKey),
					alt: focalItem.file.originalName ?? `Photo de ${catLabel}`,
					focalPointX: focalItem.focalPointX,
					focalPointY: focalItem.focalPointY
				}
			: null
	);

	function openFocal(item: GalleryItem) {
		focalItem = item;
		focalOpen = true;
	}

	const overlayButton =
		'flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80';
</script>

<!-- ===== UNE PHOTO (principale ou non) ===== -->
{#snippet photoTile(item: GalleryItem, isPrimary: boolean)}
	<div
		class="group relative overflow-hidden rounded-xl {isPrimary
			? 'col-span-2 row-span-2 aspect-square lg:aspect-auto'
			: 'aspect-square lg:aspect-auto'}"
	>
		<img
			src={publicMediaUrl(item.file.storageKey)}
			alt={item.file.originalName ?? (isPrimary ? `Photo principale de ${catLabel}` : 'Photo')}
			loading={isPrimary ? 'eager' : 'lazy'}
			class="h-full w-full object-cover"
			style={focalPointStyle(item)}
		/>

		{#if isPrimary}
			<span class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
				★ Principale
			</span>
		{/if}

		<!-- Souris : visibles au survol | Tactile : toujours visibles -->
		<div
			class="absolute top-1.5 right-1.5 flex gap-1 transition pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100"
		>
			{#if !isPrimary}
				<form
					method="POST"
					action="?/setPrimaryCatMedia"
					use:enhance={quickAction('Photo principale modifiée')}
				>
					<input type="hidden" name="mediaId" value={item.id} />
					<button
						type="submit"
						class={overlayButton}
						aria-label="Définir comme photo principale"
						title="Définir comme photo principale"
					>
						<Star class="size-4" />
					</button>
				</form>
			{/if}

			<button
				type="button"
				class={overlayButton}
				onclick={() => openFocal(item)}
				aria-label="Régler le cadrage"
				title="Régler le cadrage"
			>
				<Crosshair class="size-4" />
			</button>

			<div class="rounded-full bg-white/90">
				<DeleteButton
					iconOnly
					entityId={item.id}
					firstName={isPrimary ? 'la photo principale' : 'cette photo'}
					showDelete={true}
					actionName="?/deleteCatMedia"
					fieldName="mediaId"
					successMessage="Photo supprimée"
					deleteConfirmMessage={isPrimary
						? 'Supprimer la photo principale ? La photo suivante prendra sa place.'
						: 'Supprimer cette photo ? Cette action est définitive.'}
				/>
			</div>
		</div>
	</div>
{/snippet}

<div class="space-y-8">
	<!-- ===== EN-TÊTE ===== -->
	<div class="flex items-center justify-between gap-2">
		<h2 class="min-w-0 truncate text-lg font-semibold">Médias : {catLabel}</h2>
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

	<!-- ===== AJOUT ===== -->
	<form method="POST" action="?/addCatMedia" use:enhance={handleUpload} class="space-y-3">
		<input type="hidden" name="catId" value={cat.id} />

		<MediaUpload
			id="gallery-files"
			accept={['IMAGE', 'VIDEO']}
			bind:files
			{progress}
			multiple
			maxFiles={MAX_FILES}
			preview={false}
			label="Ajouter des photos ou des vidéos"
			disabled={uploading}
		/>

		{#if files.length > 0}
			<div class="flex justify-end">
				<Button type="submit" class="rounded-2xl" disabled={uploading}>
					{#if uploading}
						<LoaderCircle class="size-4 animate-spin" />
						Envoi…
					{:else}
						Envoyer {files.length} fichier{files.length > 1 ? 's' : ''}
					{/if}
				</Button>
			</div>
		{/if}
	</form>

	<Separator />

	<!-- ===== PHOTOS ===== -->
	<section class="space-y-4">
		<h3 class="text-lg font-semibold">Photos ({images.length})</h3>

		{#if images.length === 0}
			<div
				class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
			>
				Aucune photo
			</div>
		{:else}
			<!-- PC : 5 colonnes de 160 px de haut | Mobile : 3 colonnes de carrés -->
			<div class="grid grid-cols-3 gap-2 sm:gap-3 lg:auto-rows-40 lg:grid-cols-5">
				{#if primary}
					{@render photoTile(primary, true)}
				{/if}
				{#each otherImages as item (item.id)}
					{@render photoTile(item, false)}
				{/each}
			</div>
		{/if}
	</section>

	<Separator />

	<!-- ===== VIDÉOS ===== -->
	<section class="space-y-4">
		<h3 class="text-lg font-semibold">Vidéos ({videos.length})</h3>

		{#if videos.length === 0}
			<div
				class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
			>
				Aucune vidéo
			</div>
		{:else}
			<!-- PC : 3 colonnes | Tablette : 2 | Mobile : 1 -->
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each videos as item (item.id)}
					<div class="relative">
						<VideoPreview
							src={publicMediaUrl(item.file.storageKey)}
							mimeType={item.file.mimeType}
							label={item.file.originalName ?? `Vidéo de ${catLabel}`}
						/>
						<div class="absolute top-2 right-2 rounded-full bg-white/90">
							<DeleteButton
								iconOnly
								entityId={item.id}
								firstName="cette vidéo"
								showDelete={true}
								actionName="?/deleteCatMedia"
								fieldName="mediaId"
								successMessage="Vidéo supprimée"
								deleteConfirmMessage="Supprimer cette vidéo ? Cette action est définitive."
							/>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<FocusPointDialog bind:open={focalOpen} media={focalMedia} />
