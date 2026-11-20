<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Save, X } from '@lucide/svelte';

	interface Props {
		onCancel?: () => void;
		isSaving?: boolean;
		/**
		 * Dans une longue fenêtre (Dialog) qui défile : les boutons restent collés en bas,
		 * toujours visibles, au lieu de disparaître sous le formulaire
		 */
		sticky?: boolean;
	}

	let { onCancel, isSaving = false, sticky = false }: Props = $props();

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};
</script>

<div
	class="flex justify-end gap-3 {sticky
		? 'sticky bottom-0 z-10 -mx-6 -mb-6 border-t bg-popover/95 px-6 py-4 backdrop-blur'
		: ''}"
>
	<Button type="button" variant="outline" onclick={handleCancel} disabled={isSaving}>
		<X class="mr-2 h-4 w-4" />
		Annuler
	</Button>

	<Button type="submit" disabled={isSaving}>
		<Save class="mr-2 h-4 w-4" />
		{#if isSaving}
			Enregistrement...
		{:else}
			Enregistrer
		{/if}
	</Button>
</div>
