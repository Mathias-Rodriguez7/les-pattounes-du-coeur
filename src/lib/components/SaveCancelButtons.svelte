<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Save, X } from '@lucide/svelte';

	interface Props {
		onCancel?: () => void;
		isSaving?: boolean;
		saveLabel?: string;
		cancelLabel?: string;
		class?: string;
	}

	let {
		onCancel,
		isSaving = false,
		saveLabel = 'Enregistrer',
		cancelLabel = 'Annuler',
		class: className = ''
	}: Props = $props();

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};
</script>

<div class="flex gap-2 {className}">
	<Button type="submit" class="flex-1" disabled={isSaving}>
		<Save class="mr-2 h-4 w-4" />
		{#if isSaving}
			Enregistrement...
		{:else}
			{saveLabel}
		{/if}
	</Button>
	<Button type="button" variant="outline" class="flex-1" disabled={isSaving} onclick={handleCancel}>
		<X class="mr-2 h-4 w-4" />
		{cancelLabel}
	</Button>
</div>
