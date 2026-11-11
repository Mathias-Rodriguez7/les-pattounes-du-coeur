<script lang="ts">
	import type { InfoDocumentCategory } from '@prisma/client';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { Pencil, LoaderCircle } from '@lucide/svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import MediaUpload from '#lib/components/media/MediaUpload.svelte';
	import DocumentPreview from '#lib/components/media/DocumentPreview.svelte';
	import { INFO_DOCUMENT_CATEGORY_OPTIONS } from '#lib/constants/infoDocument.ts';
	import { uploadFile, fileKey, UploadError } from '#lib/media/upload.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		/** Seulement les champs utiles : n'importe quel objet qui les a convient */
		doc: {
			id: string;
			title: string;
			description: string | null;
			category: InfoDocumentCategory;
			url: string;
			file: { mimeType: string; sizeBytes: number; originalName: string | null };
		};
		/** Bouton icône seule (lignes de la liste sur mobile) */
		iconOnly?: boolean;
	}

	let { doc, iconOnly = false }: Props = $props();

	let open = $state(false);
	let title = $state('');
	let category = $state<string>('GUIDE');
	let description = $state('');
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});

	// À chaque ouverture : on repart des valeurs ACTUELLES du document
	$effect(() => {
		if (!open) return;
		title = doc.title;
		category = doc.category;
		description = doc.description ?? '';
		files = [];
		progress = {};
		errors = {};
	});

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		submitting = true;

		// Un nouveau fichier ? On l'envoie d'abord. Sinon, le serveur garde l'actuel.
		const file = files[0];
		if (file) {
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
		}

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				toast.success('Document modifié');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				errors = (result.data?.errors as typeof errors) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur lors de la modification');
				progress = {};
				await update({ reset: false });
			} else {
				await update();
			}
		};
	};
</script>

<!-- src/lib/components/infoDocuments/InfoDocumentEditDialog.svelte -->

<Dialog.Root bind:open>
	{#if iconOnly}
		<Dialog.Trigger
			class={buttonVariants({ variant: 'ghost', size: 'icon' })}
			aria-label="Modifier {doc.title}"
		>
			<Pencil class="size-4" />
		</Dialog.Trigger>
	{:else}
		<Dialog.Trigger class="{buttonVariants({ variant: 'outline', size: 'sm' })} rounded-2xl">
			<Pencil class="size-4" />
			Modifier
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg lg:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Modifier le document</Dialog.Title>
			<Dialog.Description>{doc.title}</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/updateInfoDocument"
			class="flex flex-col gap-4"
			use:enhance={handleEnhance}
		>
			<input type="hidden" name="id" value={doc.id} />

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px]">
				<InputField
					id="info-edit-title-{doc.id}"
					name="title"
					label="Titre"
					bind:value={title}
					error={errors.title?.[0]}
					required
				/>
				<SelectField
					id="info-edit-category-{doc.id}"
					name="category"
					label="Catégorie"
					options={INFO_DOCUMENT_CATEGORY_OPTIONS}
					bind:value={category}
					required
				/>
			</div>

			<TextareaField
				id="info-edit-description-{doc.id}"
				name="description"
				label="Description (facultatif)"
				bind:value={description}
				rows={3}
			/>

			<!-- Le fichier actuel, tant qu'on n'en a pas choisi un autre -->
			{#if files.length === 0}
				<div>
					<span class="mb-1 block text-xs text-muted-foreground">Fichier actuel</span>
					<DocumentPreview
						variant="compact"
						src={doc.url}
						name={doc.file.originalName}
						sizeBytes={doc.file.sizeBytes}
						mimeType={doc.file.mimeType}
					/>
				</div>
			{/if}

			<MediaUpload
				id="info-edit-file-{doc.id}"
				accept={['DOCUMENT']}
				allowWord
				bind:files
				{progress}
				label="Remplacer le fichier (facultatif)"
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
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
						Enregistrement…
					{:else}
						Enregistrer
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
