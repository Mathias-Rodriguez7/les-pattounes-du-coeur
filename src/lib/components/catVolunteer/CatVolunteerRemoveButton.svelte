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
	import { Pencil } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		catId: string;
		volunteerId: string;
		volunteerName?: string;
		onSuccess?: () => void;
	}

	let { catId, volunteerId, volunteerName = 'ce bénévole', onSuccess }: Props = $props();

	let isRemoving = $state(false);
	let showDialog = $state(false);

	const handleRemoveClick = () => {
		showDialog = true;
	};

	const handleRemoveEnhance: SubmitFunction = () => {
		isRemoving = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Bénévole retiré avec succès ✅');
				showDialog = false;
				if (onSuccess) {
					onSuccess();
				}
			} else if (result.type === 'failure') {
				console.error('❌ Erreur retrait bénévole:', result.data);
				toast.error((result.data?.message as string) || 'Erreur lors du retrait');
			}

			await update();
			isRemoving = false;
		};
	};
</script>

<Button
	type="button"
	variant="ghost"
	size="icon"
	class="h-5 w-5"
	disabled={isRemoving}
	onclick={handleRemoveClick}
>
	<Pencil class="h-3 w-3" />
</Button>

<Dialog bind:open={showDialog}>
	<DialogContent class="max-w-sm">
		<DialogHeader>
			<DialogTitle class="text-destructive">
				Retirer <strong>{volunteerName}</strong> de ce chat ?
			</DialogTitle>
			<DialogDescription class="pt-2">
				Ce bénévole ne sera plus référent de ce chat.
			</DialogDescription>
		</DialogHeader>

		<form method="POST" action="?/removeCatVolunteer" use:enhance={handleRemoveEnhance}>
			<input type="hidden" name="catId" value={catId} />
			<input type="hidden" name="volunteerId" value={volunteerId} />

			<DialogFooter class="flex gap-2">
				<Button
					type="button"
					variant="outline"
					class="flex-1"
					onclick={() => (showDialog = false)}
					disabled={isRemoving}
				>
					Annuler
				</Button>
				<Button type="submit" variant="destructive" class="flex-1" disabled={isRemoving}>
					{#if isRemoving}
						Retrait...
					{:else}
						Retirer
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
