<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Plus, LoaderCircle } from '@lucide/svelte';
	import SelectField from '../fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import MediaUpload from '../media/MediaUpload.svelte';
	import { CAT_DOCUMENT_KIND_OPTIONS } from '$lib/constants/cat';
	import { formatDateNum } from '$lib/utils/date';
	import { uploadFile, fileKey, UploadError } from '$lib/media/upload';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { AdoptionStatus } from '@prisma/client';
	import { ADOPTION_STATUS } from '$lib/constants/adoption';

	type AdoptionOption = {
		id: string;
		status: AdoptionStatus;
		createdAt: Date;
		profil: { firstName: string; lastName: string };
	};

	interface Props {
		catId: string;
		adoptions?: AdoptionOption[];
	}

	let { catId, adoptions = [] }: Props = $props();

	let open = $state(false);
	let kind = $state('SURRENDER');
	let date = $state<Date | undefined>(new Date());
	let note = $state('');
	let adoptionId = $state('');
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});
	let submitting = $state(false);

	// Un contrat ou un retour concerne une adoption précise
	const needsAdoption = $derived(kind === 'ADOPTION_CONTRACT' || kind === 'ADOPTION_RETURN');

	const adoptionOptions = $derived([
		{ value: '', label: 'Aucune' },
		...adoptions.map((a) => ({
			value: a.id,
			label: `${a.profil.firstName} ${a.profil.lastName} · ${formatDateNum(a.createdAt)} · ${
				ADOPTION_STATUS[a.status].label
			}`
		}))
	]);

	function resetForm() {
		kind = 'SURRENDER';
		date = new Date();
		note = '';
		adoptionId = '';
		files = [];
		progress = {};
	}

	$effect(() => {
		if (!open) resetForm();
	});

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		const file = files[0];
		if (!file) {
			toast.error('Ajoutez le document PDF');
			cancel();
			return;
		}

		submitting = true;

		// 1. Le PDF part dans le bucket PRIVÉ, dans le dossier de ce chat
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

		// Pas d'adoption pour un acte d'abandon ou un autre document
		if (!needsAdoption) formData.delete('adoptionId');

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				toast.success('Document ajouté');
				open = false;
				await update();
			} else if (result.type === 'failure') {
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
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<Plus class="size-4" />
		<span class="hidden sm:inline">Ajouter un document</span>
		<span class="sm:hidden">Ajouter</span>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg lg:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Ajouter un document</Dialog.Title>
			<Dialog.Description>
				Document privé : seules les bénévoles connectées pourront l'ouvrir.
			</Dialog.Description>
		</Dialog.Header>

		<form
			method="POST"
			action="?/createCatDocument"
			class="flex flex-col gap-4"
			use:enhance={handleEnhance}
		>
			<input type="hidden" name="catId" value={catId} />

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<SelectField
					id="cat-document-kind"
					name="kind"
					label="Type de document"
					options={CAT_DOCUMENT_KIND_OPTIONS}
					bind:value={kind}
					required
				/>

				<DatePicker name="date" label="Date de l'acte" value={date} onSelect={(d) => (date = d)} />
			</div>

			{#if needsAdoption && adoptions.length > 0}
				<SelectField
					id="cat-document-adoption"
					name="adoptionId"
					label="Adoption concernée"
					options={adoptionOptions}
					bind:value={adoptionId}
				/>
			{/if}

			<TextareaField
				id="cat-document-note"
				name="note"
				label="Note (facultatif)"
				bind:value={note}
				placeholder="Précisions utiles…"
				rows={3}
			/>

			<MediaUpload
				id="cat-document-file"
				accept={['DOCUMENT']}
				bind:files
				{progress}
				label="Document (PDF)"
				disabled={submitting}
			/>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)} disabled={submitting}
					>Annuler</Button
				>

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
