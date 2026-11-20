<script lang="ts">
	import { addDays, addYears } from 'date-fns';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { Plus, LoaderCircle } from '@lucide/svelte';
	import SelectField from '../fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import MediaUpload from '../media/MediaUpload.svelte';
	import { CAT_CARE_TYPE_OPTIONS } from '#lib/constants/cat.ts';
	import { uploadFile, fileKey, UploadError } from '#lib/media/upload.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import VeterinarianSelect from '#lib/components/veterinarians/VeterinarianSelect.svelte';
	import type { VeterinarianOption } from '#lib/server/veterinarians/queries.ts';

	type SicknessOption = { id: string; name: string; status: string };

	interface Props {
		catId: string;
		/** Les maladies du chat, pour lier le soin à l'une d'elles */
		sicknesses?: SicknessOption[];
		/** La liste des vétérinaires (page Vétérinaires), pour le champ « Vétérinaire » */
		veterinarians?: VeterinarianOption[];
	}

	let { catId, sicknesses = [], veterinarians = [] }: Props = $props();

	const MAX_DOCUMENTS = 5;

	let open = $state(false);
	let type = $state('CONTROL');
	let date = $state<Date | undefined>(new Date());
	// Vaccin : la date du rappel (facultative) ; une tâche prévient la bénévole 14 jours avant
	let nextDueDate = $state<Date | undefined>(undefined);
	let reason = $state('');
	// Le vétérinaire : un de la liste (son id), '' (non précisé) ou « Autre… » + le nom saisi
	let veterinarianChoice = $state('');
	let veterinary = $state('');
	let description = $state('');
	let sicknessId = $state('');
	let files = $state<File[]>([]);
	let progress = $state<Record<string, number>>({});
	let submitting = $state(false);

	const sicknessOptions = $derived([
		{ value: '', label: 'Aucune' },
		...sicknesses.map((s) => ({
			value: s.id,
			label: s.status === 'RESOLVED' ? `${s.name} (guérie)` : s.name
		}))
	]);

	function resetForm() {
		type = 'CONTROL';
		date = new Date();
		nextDueDate = undefined;
		reason = '';
		veterinarianChoice = '';
		veterinary = '';
		description = '';
		sicknessId = '';
		files = [];
		progress = {};
	}

	// À chaque fermeture (Échap, croix, clic à côté, succès) : formulaire vide
	$effect(() => {
		if (!open) resetForm();
	});

	const handleEnhance: SubmitFunction = async ({ formData, cancel }) => {
		submitting = true;

		// Les PDF (facultatifs) partent un par un vers S3, puis chaque clé rejoint le formulaire
		try {
			for (const file of files) {
				const uploaded = await uploadFile(file, {
					purpose: 'careDocument',
					targetId: catId,
					onProgress: (percent) => (progress = { ...progress, [fileKey(file)]: percent })
				});
				// append (et pas set) : on AJOUTE une valeur de plus sous le même nom
				formData.append('mediaStorageKey', uploaded.storageKey);
				formData.append('mediaOriginalName', uploaded.originalName);
			}
		} catch (e) {
			submitting = false;
			progress = {};
			toast.error(e instanceof UploadError ? e.message : "Échec de l'envoi d'un document");
			cancel();
			return;
		}

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				toast.success('Soin ajouté');
				open = false;
				await update();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? "Erreur lors de l'ajout du soin");
				progress = {};
				await update({ reset: false });
			} else {
				await update();
			}
		};
	};
	import RequiredLegend from '#lib/components/fields/RequiredLegend.svelte';
</script>

<!-- src/lib/components/cats/CareCreateDialog.svelte -->

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<Plus class="size-4" />
		<span class="hidden sm:inline">Ajouter un soin</span>
		<span class="sm:hidden">Ajouter</span>
	</Dialog.Trigger>

	<Dialog.Content class="max-h-[90dvh] overflow-y-auto sm:max-w-lg lg:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>Ajouter un soin</Dialog.Title>
			<Dialog.Description>
				Les documents du véto (ordonnance, facture…) restent privés : seules les bénévoles
				connectées pourront les ouvrir.
			</Dialog.Description>
		</Dialog.Header>
		<RequiredLegend class="-mt-3" />

		<form
			method="POST"
			action="?/createCare"
			class="flex flex-col gap-4"
			use:enhance={handleEnhance}
		>
			<input type="hidden" name="catId" value={catId} />

			<!-- Type + date -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<SelectField
					id="care-type"
					name="type"
					label="Type de soin"
					options={CAT_CARE_TYPE_OPTIONS}
					bind:value={type}
					required
				/>

				<DatePicker name="date" label="Date du soin" value={date} onSelect={(d) => (date = d)} />

				{#if type === 'VACCINE'}
					<!-- Une date à venir : de demain à 3 ans (le rappel d'un vaccin est au plus annuel) -->
					<div class="grid gap-1">
						<DatePicker
							name="nextDueDate"
							label="Date du rappel (facultatif)"
							value={nextDueDate}
							onSelect={(d) => (nextDueDate = d)}
							minValue={addDays(new Date(), 1)}
							maxValue={addYears(new Date(), 3)}
						/>
						{#if nextDueDate}
							<button
								type="button"
								onclick={() => (nextDueDate = undefined)}
								class="w-fit text-xs text-muted-foreground underline hover:text-foreground"
							>
								Retirer le rappel
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Motif (obligatoire) -->
			<TextareaField
				id="care-reason"
				name="reason"
				label="Motif de la visite"
				bind:value={reason}
				placeholder="Ex : rappel de vaccin, contrôle post-opératoire…"
				rows={2}
				required
			/>

			<!-- Véto + maladie liée : le véto prend toute la largeur s'il n'y a pas de maladie -->
			<div class="grid grid-cols-1 gap-4 {sicknesses.length > 0 ? 'sm:grid-cols-2' : ''}">
				<VeterinarianSelect
					{veterinarians}
					bind:choice={veterinarianChoice}
					bind:other={veterinary}
					disabled={submitting}
				/>

				{#if sicknesses.length > 0}
					<SelectField
						id="care-sickness"
						name="sicknessId"
						label="Maladie concernée"
						options={sicknessOptions}
						bind:value={sicknessId}
					/>
				{/if}
			</div>

			<!-- Compte-rendu -->
			<TextareaField
				id="care-description"
				name="description"
				label="Compte-rendu (facultatif)"
				bind:value={description}
				placeholder="Ce qu'a dit ou fait le véto…"
				rows={3}
			/>

			<!-- Documents du véto -->
			<MediaUpload
				id="care-files"
				accept={['DOCUMENT']}
				bind:files
				{progress}
				multiple
				maxFiles={MAX_DOCUMENTS}
				label="Documents du véto (PDF, facultatif)"
				disabled={submitting}
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
						Envoi…
					{:else}
						Ajouter
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
