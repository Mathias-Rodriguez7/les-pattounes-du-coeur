<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle, X } from '@lucide/svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { defaultRejectMessage, hasPlaceholder } from '#lib/adoptions/rejectMessage.ts';

	interface Props {
		formId: string;
		/** Nom de la personne, pour le titre du dialogue et le message */
		requesterName: string;
		/** Le chat demandé (demande précise), cité dans le message */
		catName?: string | null;
	}

	let { formId, requesterName, catName = null }: Props = $props();

	let open = $state(false);
	let reason = $state('');
	let message = $state('');
	let error = $state('');
	let messageError = $state('');
	let submitting = $state(false);

	// À chaque ouverture : un message tout prêt, à compléter. À la fermeture : on vide
	$effect(() => {
		if (open) {
			message = defaultRejectMessage(requesterName, catName);
		} else {
			reason = '';
			message = '';
			error = '';
			messageError = '';
		}
	});

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		// Mêmes règles que le serveur (rejectFormSchema), pour un retour immédiat
		error = reason.trim() ? '' : 'Indiquez la raison du refus';
		messageError = hasPlaceholder(message)
			? 'Complétez le passage entre crochets'
			: message.trim().length < 20
				? 'Écrivez le message envoyé à l’adoptant'
				: '';
		if (error || messageError) {
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
				const errors = result.data?.errors as Record<string, string[]> | undefined;
				error = errors?.reason?.[0] ?? '';
				messageError = errors?.message?.[0] ?? '';
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

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Refuser la demande de {requesterName}</Dialog.Title>
			<Dialog.Description>
				Le message part par email à l'adoptant, signé de votre nom : s'il répond, la réponse arrive
				sur votre adresse. La raison reste interne, dans les notes de la demande.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/rejectForm" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="formId" value={formId} />

			<TextareaField
				id="reject-reason"
				name="reason"
				label="Raison du refus (interne)"
				bind:value={reason}
				placeholder="Ex : logement pas adapté à un chat d'extérieur"
				{error}
				required
				rows={2}
				disabled={submitting}
			/>

			<TextareaField
				id="reject-message"
				name="message"
				label="Message envoyé à l'adoptant"
				bind:value={message}
				error={messageError}
				required
				rows={9}
				disabled={submitting}
			/>

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (open = false)} disabled={submitting}
					>Annuler</Button
				>

				<Button type="submit" variant="destructive" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
					{/if}
					Refuser et envoyer
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
