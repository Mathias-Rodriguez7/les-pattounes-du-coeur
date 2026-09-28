<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Sickness } from '@prisma/client';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus, Pencil } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import { SICKNESS_STATUS } from '$lib/constants/sickness';

	interface Props {
		catId: string;
		sickness?: Sickness | null;
		onSuccess?: () => void;
	}

	let { catId, sickness = null, onSuccess }: Props = $props();

	const isEdit = $derived(!!sickness);

	let open = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	// État local du formulaire
	let name = $state(sickness?.name ?? '');
	let description = $state(sickness?.description ?? '');
	let treatment = $state(sickness?.treatment ?? '');
	let startDate = $state<Date | undefined>(
		sickness?.startDate ? new Date(sickness.startDate) : undefined
	);
	let endDate = $state<Date | undefined>(
		sickness?.endDate ? new Date(sickness.endDate) : undefined
	);
	let status = $state(sickness?.status ?? 'ACTIVE');

	let formErrors = $state({ name: '' });

	const handleEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;
		formData.append('catId', catId);
		if (isEdit && sickness) {
			formData.append('sicknessId', sickness.id);
		}

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(isEdit ? 'Maladie mise à jour ✅' : 'Maladie ajoutée ✅');
				open = false;
				if (onSuccess) onSuccess();
			} else if (result.type === 'failure') {
				console.error('Erreur:', result.data);
				toast.error(result.data?.error || 'Erreur lors de l’enregistrement');
			}
			await update();
			isSaving = false;
		};
	};

	const handleCancelClick = () => {
		open = false;
	};

	const handleDeleted = () => {
		isDeleting = false;
		open = false;
		if (onSuccess) onSuccess();
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#if isEdit}
			<Button variant="ghost" size="icon">
				<Pencil class="h-4 w-4" />
			</Button>
		{:else}
			<Button variant="outline" size="sm">
				<Plus class="mr-1 h-4 w-4" />
				Ajouter une maladie
			</Button>
		{/if}
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{isEdit ? 'Modifier' : 'Ajouter'} une maladie</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action={isEdit ? '?/updateSickness' : '?/createSickness'}
			use:enhance={handleEnhance}
			class="space-y-4"
		>
			<input type="hidden" name="catId" value={catId} />
			{#if isEdit && sickness}
				<input type="hidden" name="sicknessId" value={sickness.id} />
			{/if}

			<InputField
				id="name"
				name="name"
				label="Nom de la maladie"
				bind:value={name}
				placeholder="Coryza"
				error={formErrors.name}
				required
				size="sm"
			/>

			<TextareaField
				id="description"
				name="description"
				label="Description"
				bind:value={description}
				placeholder="Détails sur la maladie..."
			/>

			<TextareaField
				id="treatment"
				name="treatment"
				label="Traitement"
				bind:value={treatment}
				placeholder="Traitement en cours..."
			/>

			<div class="grid grid-cols-2 gap-4">
				<DatePicker
					name="startDate"
					value={startDate}
					onSelect={(date) => (startDate = date)}
					label="Date de début"
				/>

				<DatePicker
					name="endDate"
					value={endDate}
					onSelect={(date) => (endDate = date)}
					label="Date de fin"
				/>
			</div>

			<SelectField
				id="status"
				name="status"
				label="Statut"
				bind:value={status}
				options={SICKNESS_STATUS}
				size="sm"
				required
			/>

			<Dialog.Footer class="flex justify-between sm:justify-between">
				{#if isEdit && sickness}
					<DeleteButton
						entityId={sickness.id}
						firstName={sickness.name}
						lastName=""
						{isDeleting}
						{isSaving}
						showDelete={true}
						actionName="?/deleteSickness"
						fieldName="sicknessId"
						deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer cette maladie ?"
						onSuccess={handleDeleted}
					/>
				{:else}
					<div></div>
				{/if}

				<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
