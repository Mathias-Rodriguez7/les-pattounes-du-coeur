<script lang="ts">
	import type { MediaType } from '@prisma/client';
	import { getMediaTypeFromMime } from '$lib/media/rules';
	import ImagePreview from './ImagePreview.svelte';
	import VideoPreview from './VideoPreview.svelte';
	import DocumentPreview from './DocumentPreview.svelte';

	interface Props {
		src: string;
		/** Le plus fiable : le type enregistré en base */
		type?: MediaType | null;
		mimeType?: string | null;
		name?: string | null;
		sizeBytes?: number | null;
		alt?: string;
		/** Pour les PDF uniquement */
		variant?: 'card' | 'embed';
		class?: string;
	}

	let {
		src,
		type,
		mimeType,
		name,
		sizeBytes,
		alt,
		variant = 'card',
		class: classList = ''
	}: Props = $props();

	// Le type enregistré en base, sinon celui déduit du mimeType
	const resolvedType = $derived(type ?? getMediaTypeFromMime(mimeType));
</script>

{#if resolvedType === 'IMAGE'}
	<ImagePreview {src} alt={alt ?? name ?? ''} class="rounded-lg {classList}" />
{:else if resolvedType === 'VIDEO'}
	<VideoPreview {src} {mimeType} label={alt ?? name ?? 'Vidéo'} class={classList} />
{:else if resolvedType === 'DOCUMENT'}
	<DocumentPreview {src} {name} {sizeBytes} {variant} class={classList} />
{:else}
	<!-- Type inconnu : simple lien -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -- fichier média, pas une route -->
	<a
		href={src}
		target="_blank"
		rel="noopener noreferrer"
		class="block text-sm break-all text-blue-600 underline hover:text-blue-800 {classList}"
	>
		{name ?? src}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}
