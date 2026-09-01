<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Save, X, Trash2 } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';

	interface Props {
		onCancel?: () => void;
		onDelete?: () => void | Promise<void>;
		isSaving?: boolean;
		isDeleting?: boolean;
		saveLabel?: string;
		cancelLabel?: string;
		deleteLabel?: string;
		deleteConfirmMessage?: string;
		showDelete?: boolean;
		class?: string;
	}

	let {
		onCancel,
		onDelete,
		isSaving = false,
		isDeleting = false,
		saveLabel = 'Enregistrer',
		cancelLabel = 'Annuler',
		deleteLabel = 'Supprimer',
		deleteConfirmMessage = 'Êtes-vous sûr ? Cette action est irréversible.',
		showDelete = false,
		class: className = ''
	}: Props = $props();

	let showDeleteDialog = $state(false);

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
	};

	const handleDeleteClick = () => {
		showDeleteDialog = true;
	};

	const handleConfirmDelete = async () => {
		if (onDelete) {
			await onDelete();
		}
		showDeleteDialog = false;
	};
</script>

<div class="space-y-6 {className}">
	<!-- ROW 1: Save + Cancel -->
	<div class="flex gap-2">
		<Button type="submit" class="flex-1" disabled={isSaving || isDeleting}>
			<Save class="mr-2 h-4 w-4" />
			{#if isSaving}
				Enregistrement...
			{:else}
				{saveLabel}
			{/if}
		</Button>
		<Button
			type="button"
			variant="outline"
			class="flex-1"
			disabled={isSaving || isDeleting}
			onclick={handleCancel}
		>
			<X class="mr-2 h-4 w-4" />
			{cancelLabel}
		</Button>
	</div>

	<!-- SÉPARATEUR VISUEL -->
	{#if showDelete}
		<Separator class="opacity-50" />

		<!-- ROW 2: Delete (full width, destructive) -->
		<Button
			type="button"
			variant="destructive"
			class="w-full"
			disabled={isSaving || isDeleting}
			onclick={handleDeleteClick}
		>
			<Trash2 class="mr-2 h-4 w-4" />
			{#if isDeleting}
				Suppression en cours...
			{:else}
				{deleteLabel}
			{/if}
		</Button>
	{/if}
</div>

<!-- ✅ DIALOG DE CONFIRMATION DELETE -->
<Dialog open={showDeleteDialog} onOpenChange={(open) => (showDeleteDialog = open)}>
	<DialogContent class="max-w-sm">
		<DialogHeader>
			<DialogTitle class="text-destructive">Supprimer définitivement</DialogTitle>
			<DialogDescription class="pt-2">
				{deleteConfirmMessage}
			</DialogDescription>
		</DialogHeader>
		<DialogFooter class="flex gap-2">
			<Button
				type="button"
				variant="outline"
				class="flex-1"
				onclick={() => (showDeleteDialog = false)}
				disabled={isDeleting}
			>
				Annuler
			</Button>
			<Button
				type="button"
				variant="destructive"
				class="flex-1"
				onclick={handleConfirmDelete}
				disabled={isDeleting}
			>
				{#if isDeleting}
					Suppression...
				{:else}
					Supprimer
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
