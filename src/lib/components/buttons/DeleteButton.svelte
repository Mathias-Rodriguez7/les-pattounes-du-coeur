<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		entityId?: string;
		firstName?: string;
		lastName?: string;
		isDeleting?: boolean;
		isSaving?: boolean;
		deleteLabel?: string;
		deleteConfirmMessage?: string;
		showDelete?: boolean;
		actionName?: string; // ✅ ex: '?/deleteProfile' ou '?/deleteCat'
		fieldName?: string; // ✅ ex: 'profileId' ou 'catId'
		successMessage?: string;
		onSuccess?: () => void;
	}

	let {
		entityId,
		firstName = '',
		lastName = '',
		isDeleting = $bindable(false),
		isSaving = false,
		deleteLabel = 'Supprimer',
		deleteConfirmMessage = 'Êtes-vous sûr ? Cette action est irréversible.',
		showDelete = false,
		actionName = '?/deleteProfile',
		fieldName = 'profileId',
		successMessage = 'Supprimé avec succès ! ✅',
		onSuccess
	}: Props = $props();

	let showDeleteDialog = $state(false);

	const handleDeleteClick = () => {
		showDeleteDialog = true;
	};

	const handleDeleteEnhance: SubmitFunction = () => {
		isDeleting = true;

		return async ({ result, update }) => {
			console.log('📥 Réponse delete:', result);

			if (result.type === 'success') {
				console.log('✅ Supprimé avec succès');
				toast.success(successMessage);
				showDeleteDialog = false;
				if (onSuccess) {
					onSuccess();
				}
			} else if (result.type === 'failure') {
				console.error('❌ Erreur suppression:', result.data);
				toast.error(result.data?.error || 'Erreur lors de la suppression');
			}

			await update();
			isDeleting = false;
		};
	};
</script>

<div>
	{#if showDelete}
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

<Dialog bind:open={showDeleteDialog}>
	<DialogContent class="max-w-sm">
		<DialogHeader>
			<DialogTitle class="text-destructive">
				Vous êtes sur le point de supprimer <strong>{firstName} {lastName}</strong>
			</DialogTitle>
			<DialogDescription class="pt-2">
				{deleteConfirmMessage}
			</DialogDescription>
		</DialogHeader>

		<form method="POST" action={actionName} use:enhance={handleDeleteEnhance}>
			<input type="hidden" name={fieldName} value={entityId} />

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
				<Button type="submit" variant="destructive" class="flex-1" disabled={isDeleting}>
					{#if isDeleting}
						Suppression...
					{:else}
						Supprimer
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
