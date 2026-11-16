<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Hourglass } from '@lucide/svelte';

	// Au-dessus de la liste : « 2 candidatures en attente · Afficher ».
	// Un clic applique le filtre « En attente de validation ». Rien s'il n'y en a pas.
	interface Props {
		count: number;
		/** Le filtre « En attente » est déjà appliqué : le bandeau propose de revenir à la liste */
		active: boolean;
		onShow: () => void;
		onHide: () => void;
	}

	let { count, active, onShow, onHide }: Props = $props();

	const label = $derived(
		count > 1
			? `${count} candidatures en attente de validation`
			: '1 candidature en attente de validation'
	);
</script>

{#if count > 0}
	<div
		class="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
	>
		<p class="flex items-center gap-2">
			<Hourglass class="size-4 shrink-0" />
			{active ? 'Seules les candidatures en attente sont affichées' : label}
		</p>
		<Button
			variant="ghost"
			size="sm"
			class="h-7 text-amber-900 hover:bg-amber-100"
			onclick={active ? onHide : onShow}
		>
			{active ? 'Revenir à la liste' : 'Afficher'}
		</Button>
	</div>
{/if}
