<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { BadgeCheck, LoaderCircle, TriangleAlert } from '@lucide/svelte';
	import CheckboxField from '../fields/CheckboxField.svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		adoptionId: string;
		catName: string;
		/** La fiche indique déjà que le chat est stérilisé */
		isSterilized: boolean;
		/** Ce que le ménage de la galerie va supprimer (calculé par le parent) */
		removedPhotos: number;
		removedVideos: number;
		/** true tant que la période d'essai n'est pas terminée */
		disabled?: boolean;
	}

	let {
		adoptionId,
		catName,
		isSterilized,
		removedPhotos,
		removedVideos,
		disabled = false
	}: Props = $props();

	let open = $state(false);
	let sterilizationChecked = $state(false);
	let submitting = $state(false);

	// À chaque fermeture, la case est décochée : il faut la recocher en connaissance de cause
	$effect(() => {
		if (!open) sterilizationChecked = false;
	});

	const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`;
	const removedTotal = $derived(removedPhotos + removedVideos);
	const removedLabel = $derived(
		[
			removedPhotos > 0 && plural(removedPhotos, 'photo'),
			removedVideos > 0 && plural(removedVideos, 'vidéo')
		]
			.filter(Boolean)
			.join(' et ')
	);

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		// Le serveur l'exige aussi (z.literal('true')) : ici, c'est seulement pour un message immédiat
		if (!sterilizationChecked) {
			toast.error('Confirmez que la stérilisation a été vérifiée');
			cancel();
			return;
		}

		submitting = true;

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Adoption définitive');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur lors de la finalisation');
				await update({ reset: false });
			} else {
				toast.error('Erreur serveur');
				await update();
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ size: 'sm' })} {disabled}>
		<BadgeCheck class="size-4" />
		Finaliser
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Finaliser l'adoption de {catName}</Dialog.Title>
			<Dialog.Description>
				La période d'essai est terminée : l'adoption devient définitive.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/finalizeAdoption"
			use:enhance={handleEnhance}
			class="flex flex-col gap-4"
		>
			<input type="hidden" name="adoptionId" value={adoptionId} />

			<CheckboxField
				id="finalize-sterilization"
				name="sterilizationChecked"
				label="Stérilisation vérifiée"
				description={isSterilized
					? 'La fiche indique déjà que le chat est stérilisé.'
					: 'La fiche du chat sera mise à jour : stérilisé.'}
				checked={sterilizationChecked}
				onChange={(value) => (sterilizationChecked = value)}
				disabled={submitting}
			/>

			{#if removedTotal > 0}
				<div
					class="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
				>
					<TriangleAlert class="size-4 shrink-0" />
					<p>
						Ménage de la galerie : <strong>{removedLabel}</strong>
						{removedTotal > 1 ? 'seront supprimées' : 'sera supprimée'} définitivement. La photo principale
						et tous les documents PDF sont conservés.
					</p>
				</div>
			{/if}

			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={!sterilizationChecked || submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
					{/if}
					Rendre définitive
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
