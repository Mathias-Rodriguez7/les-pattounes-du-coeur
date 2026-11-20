<script lang="ts">
	import { CircleAlert } from '@lucide/svelte';

	// Le message d'erreur sous un champ : le même partout (icône, couleur, taille).
	// `id` : relié au champ par aria-describedby, le lecteur d'écran le lit avec le champ.
	let { id, error }: { id?: string; error?: string } = $props();
</script>

{#if error}
	<p {id} class="mt-1 flex items-start gap-1 text-xs text-red-600">
		<CircleAlert class="mt-px size-3.5 shrink-0" aria-hidden="true" />
		{error}
	</p>
{/if}
