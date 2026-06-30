<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		target: number;
		duration?: number;
	};

	let { target, duration = 1500 }: Props = $props();

	let displayed = $state(0);

	onMount(() => {
		const start = performance.now();

		const animate = (now: number) => {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			// easeOut
			const eased = 1 - Math.pow(1 - progress, 3);
			displayed = Math.round(eased * target);

			if (progress < 1) requestAnimationFrame(animate);
		};

		requestAnimationFrame(animate);
	});
</script>

{displayed}
