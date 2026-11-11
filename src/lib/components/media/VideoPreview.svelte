<!-- src/lib/components/media/VideoPreview.svelte -->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';

	interface Props {
		src: string;
		/** Type MIME enregistré en base (video/mp4, video/webm…). Si absent, le navigateur devine */
		mimeType?: string | null;
		/** Image affichée avant la lecture */
		poster?: string;
		/** Description pour les lecteurs d'écran */
		label?: string;
		/**
		 * player  : lecteur avec contrôles, ne charge rien avant le clic (défaut)
		 * ambient : muet, en boucle, sans contrôles (cartes, vignettes)
		 */
		mode?: 'player' | 'ambient';
		class?: string;
	}

	let {
		src,
		mimeType,
		poster,
		label = 'Vidéo',
		mode = 'player',
		class: classList = ''
	}: Props = $props();

	// Respecte le réglage système « réduire les animations »
	const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce');
	const autoplay = $derived(mode === 'ambient' && !reducedMotion.current);

	// « video/quicktime » fait abandonner Chrome et Firefox AVANT d'essayer,
	// alors qu'un .mov contient souvent de la vidéo H.264 qu'ils savent lire.
	// Sans type, le navigateur regarde le fichier lui-même et décide.
	const sourceType = $derived(mimeType && mimeType !== 'video/quicktime' ? mimeType : undefined);
</script>

{#if mode === 'ambient'}
	<!-- Muette → pas besoin de sous-titres -->
	<video
		{poster}
		{autoplay}
		muted
		loop
		playsinline
		preload={autoplay ? 'auto' : 'metadata'}
		aria-label={label}
		class="h-full w-full object-cover {classList}"
	>
		<source {src} type={sourceType} />
	</video>
{:else}
	<video
		{poster}
		controls
		playsinline
		preload="metadata"
		aria-label={label}
		class="w-full rounded-lg bg-black {classList}"
	>
		<source {src} type={sourceType} />
		<!-- Le son peut être activé → piste de sous-titres attendue (vide pour l'instant) -->
		<track kind="captions" />
	</video>
{/if}
