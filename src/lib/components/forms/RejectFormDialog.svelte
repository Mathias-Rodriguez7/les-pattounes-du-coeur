<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { LoaderCircle, X } from '@lucide/svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		formId: string;
		/** Nom de la personne, pour le titre du dialogue */
		requesterName: string;
	}

	let { formId, requesterName }: Props = $props();

	let open = $state(false);
	let reason = $state('');
	let error = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (!open) {
			reason = '';
			error = '';
		}
	});

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		if (!reason.trim()) {
			error = 'Indiquez la raison du refus';
			cancel();
			return;
		}
		submitting = true;

		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Demande refusée');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				error = (result.data?.errors as Record<string, string[]>)?.reason?.[0] ?? '';
				toast.error((result.data?.error as string) ?? 'Erreur lors du refus');
				await update({ reset: false });
			} else {
				toast.error('Erreur serveur');
				await update();
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'outline', size: 'sm' })}
		aria-label="Refuser la demande de {requesterName}"
	>
		<X class="size-4" />
		Refuser
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Refuser la demande de {requesterName}</Dialog.Title>
			<Dialog.Description>
				La raison est ajoutée aux notes de la demande. L'adoptant n'est pas prévenu automatiquement
				: pensez à l'appeler.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/rejectForm" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="formId" value={formId} />

			<TextareaField
				id="reject-reason"
				name="reason"
				label="Raison du refus"
				bind:value={reason}
				placeholder="Ex : logement pas adapté à un chat d'extérieur"
				{error}
				required
				disabled={submitting}
			/>

			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Annuler
				</Button>
				<Button type="submit" variant="destructive" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
					{/if}
					Refuser la demande
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
