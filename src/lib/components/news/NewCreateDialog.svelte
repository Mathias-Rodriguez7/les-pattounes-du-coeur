<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import { NEWS_TYPE_OPTIONS } from '$lib/constants/news.js';
	import { enhance } from '$app/forms';

	let { open = $bindable(false), onCancel } = $props();

	let title = $state('');
	let type = $state('NEWS');
	let content = $state('');
	let file = $state<File | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let submitting = $state(false);

	function handleFileChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const selected = target.files?.[0] ?? null;

		if (selected && selected.type !== 'application/pdf') {
			alert('Seuls les fichiers PDF sont acceptés.');
			target.value = '';
			file = null;
			return;
		}

		if (selected && selected.size > 10 * 1024 * 1024) {
			alert('Le fichier ne doit pas dépasser 10 Mo.');
			target.value = '';
			file = null;
			return;
		}

		file = selected;
	}

	function removeFile() {
		file = null;
		if (fileInput) fileInput.value = '';
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nouvelle news</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action="?/create"
			enctype="multipart/form-data"
			class="flex flex-col gap-4"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
		>
			<div class="grid grid-cols-2 gap-4">
				<InputField
					id="title"
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
					options={NEWS_TYPE_OPTIONS}
					bind:value={type}
				/>
			</div>

			<TextareaField
				id="content"
				name="content"
				label="Description"
				bind:value={content}
				placeholder="Description..."
			/>

			<!-- 📎 UPLOAD PDF -->
			<div class="flex flex-col gap-2">
				<label for="media" class="text-sm font-medium">Document (PDF)</label>
				<input
					id="media"
					name="media"
					type="file"
					accept="application/pdf"
					bind:this={fileInput}
					onchange={handleFileChange}
					class="file:bg-muted hover:file:bg-accent text-sm file:mr-4 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm"
				/>
				{#if file}
					<div class="text-muted-foreground flex items-center justify-between text-sm">
						<span class="truncate">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} Mo)</span>
						<Button type="button" variant="ghost" size="sm" onclick={removeFile}>Retirer</Button>
					</div>
				{/if}
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={onCancel} disabled={submitting}>
					Annuler
				</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Création...' : 'Créer'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
