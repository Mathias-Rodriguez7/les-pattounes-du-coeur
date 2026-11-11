<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import { LoaderCircle } from '@lucide/svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import MediaUpload from '../media/MediaUpload.svelte';
	import { NEWS_TYPE_OPTIONS_CLASSIC } from '$lib/constants/news.js';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { uploadFile, fileKey, UploadError } from '$lib/media/upload';

	interface Props {
		open?: boolean;
		onCancel?: () => void;
	}

	let { open = $bindable(false), onCancel }: Props = $props();

	let title = $state('');
	let type = $state('NEWS');
	let content = $state('');
	let files = $state<File[]>([]);
	let submitting = $state(false);
	let progress = $state<Record<string, number>>({});

	function resetForm() {
		title = '';
		type = 'NEWS';
		content = '';
		files = [];
	}

	// À chaque fermeture (Échap, croix, clic à côté, succès) : formulaire vide
	$effect(() => {
		if (!open) resetForm();
	});

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		submitting = true;

		// 1. Le PDF part d'abord à S3, puis seule sa clé rejoint le formulaire
		const file = files[0];
		if (file) {
			try {
				const uploaded = await uploadFile(file, {
					purpose: 'news',
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

		// 2. Puis le formulaire part normalement
		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				toast.success('News créée');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur lors de la création');
				await update({ reset: false });
			} else {
				await update();
			}
		};
	};
</script>

<!-- src/lib/components/news/NewCreateDialog.svelte -->

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg lg:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Nouvelle news</Dialog.Title>
			<Dialog.Description>Elle sera visible sur la page publique des news.</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/create" class="flex flex-col gap-4" use:enhance={handleEnhance}>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<InputField
					id="new-news-title"
					name="title"
					label="Titre"
					bind:value={title}
					placeholder="Titre"
					required
					size="sm"
				/>

				<SelectField
					id="new-news-type"
					label="Type"
					name="type"
					required
					options={NEWS_TYPE_OPTIONS_CLASSIC}
					bind:value={type}
				/>
			</div>

			<TextareaField
				id="new-news-content"
				name="content"
				label="Description"
				bind:value={content}
				placeholder="Description..."
			/>

			<MediaUpload
				id="new-news-media"
				accept={['DOCUMENT']}
				bind:files
				{progress}
				label="Document (PDF)"
				disabled={submitting}
			/>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={onCancel} disabled={submitting}>
					Annuler
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="size-4 animate-spin" />
						Création…
					{:else}
						Créer
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
