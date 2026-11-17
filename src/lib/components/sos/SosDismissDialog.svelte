<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle } from '@lucide/svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { SOS_DISMISS_REASON_OPTIONS } from '#lib/constants/sos.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Classer un SOS sans suite : la raison (obligatoire) et une note
	let { sosId }: { sosId: string } = $props();

	let open = $state(false);
	let reason = $state('');
	let note = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (!open) {
			reason = '';
			note = '';
		}
	});

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		if (!reason) {
			toast.error('Choisissez une raison');
			cancel();
			return;
		}
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				open = false;
				await update();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		Classer sans suite…
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Classer ce SOS sans suite</Dialog.Title>
			<Dialog.Description
				>Aucun chat ne sera créé. Vous pourrez le rouvrir si besoin.</Dialog.Description
			>
		</Dialog.Header>
		<form method="POST" action="?/dismissSos" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="sosId" value={sosId} />
			<SelectField
				id="sos-dismiss-reason"
				name="dismissReason"
				label="Raison"
				options={SOS_DISMISS_REASON_OPTIONS}
				bind:value={reason}
				required
			/>
			<TextareaField
				id="sos-dismiss-note"
				name="dismissNote"
				label="Note (facultative)"
				placeholder="Ce qui s'est passé…"
				bind:value={note}
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
				<Button type="submit" disabled={submitting}>
					{#if submitting}<LoaderCircle class="size-4 animate-spin" />{/if}
					Classer sans suite
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
