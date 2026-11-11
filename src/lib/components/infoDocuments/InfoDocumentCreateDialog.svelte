<!-- src/lib/components/infoDocuments/InfoDocumentCreateDialog.svelte -->
<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Plus, LoaderCircle } from '@lucide/svelte';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';
	import MediaUpload from '$lib/components/media/MediaUpload.svelte';
	import { INFO_DOCUMENT_CATEGORY_OPTIONS } from '$lib/constants/infoDocument';
	import { uploadFile, fileKey, UploadError } from '$lib/media/upload';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '@sveltejs/kit';

	let open = $state(false);
	let title = $state('');
	let category = $state('GUIDE');
	let description = $state('');
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});

	function resetForm() {
		title = '';
		category = 'GUIDE';
		description = '';
		files = [];
		progress = {};
		errors = {};
	}

	$effect(() => {
		if (!open) resetForm();
	});

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		const file = files[0];
		if (!file) {
			toast.error('Ajoutez le document');
			cancel();
			return;
		}

		submitting = true;

		// 1. Le fichier part dans le bucket PRIVÉ, dossier « info/ »
		//    🆕 Pas de targetId : ce document n'appartient à aucun chat ni aucune news
		try {
			const uploaded = await uploadFile(file, {
				purpose: 'infoDocument',
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

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				toast.success('Document ajouté');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				// 🆕 Les erreurs par champ (titre vide…) s'affichent sous le champ concerné
				errors = (result.data?.errors as typeof errors) ?? {};
				toast.error((result.data?.error as string) ?? "Erreur lors de l'ajout");
				progress = {};
				await update({ reset: false });
			} else {
				await update();
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="{buttonVariants({ size: 'sm' })} rounded-2xl">
		<Plus class="size-4" />
		<span class="hidden sm:inline">Ajouter un document</span>
		<span class="sm:hidden">Ajouter</span>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg lg:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Ajouter un document</Dialog.Title>
			<Dialog.Description>Il sera visible par toutes les bénévoles connectées.</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/createInfoDocument"
			class="flex flex-col gap-4"
			use:enhance={handleEnhance}
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
				<InputField
					id="info-document-title"
					name="title"
					label="Titre"
					bind:value={title}
					placeholder="Manuel du gestionnaire"
					error={errors.title?.[0]}
					required
				/>
				<SelectField
					id="info-document-category"
					name="category"
					label="Catégorie"
					options={INFO_DOCUMENT_CATEGORY_OPTIONS}
					bind:value={category}
					required
				/>
			</div>

			<TextareaField
				id="info-document-description"
				name="description"
				label="Description (facultatif)"
				bind:value={description}
				placeholder="À quoi sert ce document ?"
				rows={3}
			/>

			<!-- 🆕 allowWord : la seule page où un .docx est accepté -->
			<MediaUpload
				id="info-document-file"
				accept={['DOCUMENT']}
				allowWord
				bind:files
				{progress}
				label="Document (PDF ou Word)"
				disabled={submitting}
				error={errors.media?.[0]}
			/>

			<Dialog.Footer>
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={submitting || files.length === 0}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
						Envoi…
					{:else}
						Ajouter
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
