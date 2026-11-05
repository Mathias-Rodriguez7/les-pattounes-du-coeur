<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		/** Point focal en % (galerie des chats) */
		focalPoint?: { x: number; y: number };
		class?: string;
	}

	let { src, alt, focalPoint, class: classList = '' }: Props = $props();
</script>

<img
	{src}
	{alt}
	loading="lazy"
	decoding="async"
	class="h-full w-full object-cover {classList}"
	style:object-position={focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : undefined}
/>
