<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Save, X } from '@lucide/svelte';

	interface Props {
		onCancel?: () => void;
		isSaving?: boolean;
	}

	let { onCancel, isSaving = false }: Props = $props();

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};
</script>

<div class="flex justify-end gap-3">
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
