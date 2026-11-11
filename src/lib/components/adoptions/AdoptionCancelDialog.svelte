<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { LoaderCircle, Undo2 } from '@lucide/svelte';
	import SelectField from '../fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import MediaUpload from '../media/MediaUpload.svelte';
	import { uploadFile, fileKey, UploadError } from '$lib/media/upload';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		adoptionId: string;
		catId: string;
		catName: string;
		/** Adoption définitive : on le rappelle dans le dialogue (l'annulation reste possible) */
		isFinal: boolean;
	}

	let { adoptionId, catId, catName, isFinal }: Props = $props();

	const STATUS_OPTIONS = [
		{ value: 'AVAILABLE', label: "Disponible à l'adoption" },
		{ value: 'SOCIALIZE', label: 'En socialisation' }
	];

	let open = $state(false);
	let catStatus = $state('AVAILABLE');
	let reason = $state('');
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});
	let submitting = $state(false);

	// À chaque ouverture, on repart de zéro
	$effect(() => {
		if (!open) {
			catStatus = 'AVAILABLE';
			reason = '';
			files = [];
			progress = {};
		}
	});

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		submitting = true;

		// Document de retour facultatif : s'il y en a un, il part d'abord sur S3 (bucket privé)
		const file = files[0];
		if (file) {
			try {
				const uploaded = await uploadFile(file, {
					purpose: 'catDocument',
					targetId: catId,
					onProgress: (percent) => (progress = { [fileKey(file)]: percent })
				});
				formData.set('mediaStorageKey', uploaded.storageKey);
				formData.set('mediaOriginalName', uploaded.originalName);
			} catch (e) {
				submitting = false;
				progress = {};
				toast.error(e instanceof UploadError ? e.message : "Échec de l'envoi du document");
				cancel();
				return;
			}
		}

		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success((result.data?.message as string) ?? 'Adoption annulée');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? "Erreur lors de l'annulation");
				progress = {};
				await update({ reset: false });
			} else {
				toast.error('Erreur serveur');
				await update();
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<!-- ghost : action rare et lourde, elle ne doit pas attirer l'œil autant que « Finaliser » -->
	<Dialog.Trigger
		class="{buttonVariants({
			variant: 'ghost',
			size: 'sm'
		})} text-muted-foreground hover:text-destructive"
	>
		<Undo2 class="size-4" />
		<!-- Court sur le bouton (il partage la ligne du titre), complet pour les lecteurs d'écran -->
		<span aria-hidden="true">Annuler</span>
		<span class="sr-only">Annuler l'adoption</span>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Annuler l'adoption de {catName}</Dialog.Title>
			<Dialog.Description>
				{isFinal ? 'Cette adoption était définitive. ' : ''}{catName} revient à l'association : il faudra
				lui trouver une famille d'accueil.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/cancelAdoption" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="adoptionId" value={adoptionId} />

			<SelectField
				id="cancel-cat-status"
				name="catStatus"
				label="Le chat repasse en"
				options={STATUS_OPTIONS}
				bind:value={catStatus}
				disabled={submitting}
				required
			/>

			<TextareaField
				id="cancel-reason"
				name="reason"
				label="Pourquoi ? (facultatif)"
				bind:value={reason}
				placeholder="Ex : allergie dans la famille, le chat ne s'entend pas avec le chien"
				disabled={submitting}
			/>

			<MediaUpload
				id="cancel-document"
				accept={['DOCUMENT']}
				bind:files
				{progress}
				label="Document de retour (PDF, facultatif)"
				disabled={submitting}
			/>

			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Retour
				</Button>
				<Button type="submit" variant="destructive" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
					{/if}
					Confirmer l'annulation
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
