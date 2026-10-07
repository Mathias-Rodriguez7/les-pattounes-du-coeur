<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input/index.js';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { NEWS_TYPE_OPTIONS } from '$lib/constants/news.js';

	let { open = $bindable(false), onCancel } = $props();

	let title = $state('');
	let type = $state('NEWS');
	let content = $state('');
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nouvelle news</Dialog.Title>
		</Dialog.Header>

		<form method="POST" action="?/create" class="flex flex-col gap-4">
			<Input name="title" placeholder="Titre" bind:value={title} required />
			<SelectField
				id="new-news-type"
				label="Type"
				name="type"
				options={NEWS_TYPE_OPTIONS}
				bind:value={type}
			/>
			<textarea
				name="content"
				placeholder="Contenu"
				bind:value={content}
				class="border-input min-h-32 rounded-md border bg-transparent p-2 text-sm"
			></textarea>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={onCancel}>Annuler</Button>
				<Button type="submit">Créer</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
