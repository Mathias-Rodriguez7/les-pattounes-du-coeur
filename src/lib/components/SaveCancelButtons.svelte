<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Save, X } from '@lucide/svelte';

	interface Props {
		onSave?: () => void | Promise<void>;
		onCancel?: () => void;
		isSaving?: boolean;
		saveLabel?: string;
		cancelLabel?: string;
		class?: string;
	}

	let {
		onSave,
		onCancel,
		isSaving = false,
		saveLabel = 'Enregistrer',
		cancelLabel = 'Annuler',
		class: className = ''
	}: Props = $props();

	let isLoading = $state(false);

	const handleSave = async () => {
		isLoading = true;
		try {
			if (onSave) {
				await onSave();
			}
		} finally {
			isLoading = false;
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};
</script>

<div class="flex gap-2 {className}">
	<Button type="button" class="flex-1" disabled={isLoading || isSaving} onclick={handleSave}>
		<Save class="mr-2 h-4 w-4" />
		{#if isLoading || isSaving}
			Enregistrement...
		{:else}
			{saveLabel}
		{/if}
	</Button>
	<Button
		type="button"
		variant="outline"
		class="flex-1"
		disabled={isLoading || isSaving}
		onclick={handleCancel}
	>
		<X class="mr-2 h-4 w-4" />
		{cancelLabel}
	</Button>
</div>
