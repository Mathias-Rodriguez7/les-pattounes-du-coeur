<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle, UserRoundPen } from '@lucide/svelte';
	import VolunteerCombobox from '#lib/components/volunteers/VolunteerCombobox.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Admin : confier un SOS à une bénévole (liste avec recherche)
	interface Props {
		sosId: string;
		/** La bénévole qui le traite déjà (pas proposée) */
		currentId: string | null;
		volunteers: { id: string; name: string }[];
	}

	let { sosId, currentId, volunteers }: Props = $props();

	let open = $state(false);
	let volunteerId = $state('');
	let submitting = $state(false);
	const choices = $derived(volunteers.filter((v) => v.id !== currentId));

	$effect(() => {
		if (!open) volunteerId = '';
	});

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				open = false;
				await update({ reset: false });
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<UserRoundPen class="size-4" />
		{currentId ? 'Confier à une autre' : 'Confier à…'}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Confier ce SOS</Dialog.Title>
			<Dialog.Description>
				La bénévole choisie le traitera : elle verra le contact de la personne qui signale.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/assignSos" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="sosId" value={sosId} />
			<VolunteerCombobox volunteers={choices} bind:value={volunteerId} />
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (open = false)}>Annuler</Button>
				<Button type="submit" disabled={!volunteerId || submitting}>
					{#if submitting}<LoaderCircle class="size-4 animate-spin" />{/if}
					Confier
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
