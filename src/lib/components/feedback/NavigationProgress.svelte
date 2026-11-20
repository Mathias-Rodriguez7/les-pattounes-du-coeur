<script lang="ts">
	import { navigating } from '$app/state';

	// Une fine barre en haut de l'écran pendant le chargement d'une page.
	// Elle n'apparaît qu'après 150 ms : une page rapide ne fait pas clignoter l'écran.

	let visible = $state(false);

	$effect(() => {
		if (!navigating.to) {
			visible = false;
			return;
		}
		const timer = setTimeout(() => (visible = true), 150);
		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<div
		role="progressbar"
		aria-label="Chargement de la page"
		class="fixed inset-x-0 top-0 z-100 h-1 overflow-hidden bg-primary/20"
	>
		<div class="nav-progress h-full w-1/3 rounded-full bg-primary"></div>
	</div>
{/if}

<style>
	/* La barre file de gauche à droite tant que la page charge */
	.nav-progress {
		animation: nav-progress 1.1s ease-in-out infinite;
	}
	@keyframes nav-progress {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(300%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.nav-progress {
			animation: none;
			width: 100%;
			opacity: 0.6;
		}
	}
</style>
