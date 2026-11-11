<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import type { Sickness, SicknessStatus } from '@prisma/client';
	import { untrack } from 'svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { Plus, Pencil } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import { SICKNESS_STATUS } from '#lib/constants/sickness.ts';

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

	// État local du formulaire : rempli à chaque OUVERTURE avec la maladie actuelle.
	// (Avant, il gardait les valeurs du premier affichage : après une modification ou un ajout,
	// rouvrir le dialogue montrait d'anciennes valeurs.)
	let name = $state('');
	let description = $state('');
	let treatment = $state('');
	let startDate = $state<Date | undefined>(undefined);
	let endDate = $state<Date | undefined>(undefined);
	let status = $state<SicknessStatus>('ACTIVE');

	function fillFromSickness() {
		name = sickness?.name ?? '';
		description = sickness?.description ?? '';
		treatment = sickness?.treatment ?? '';
		startDate = sickness?.startDate ? new Date(sickness.startDate) : undefined;
		endDate = sickness?.endDate ? new Date(sickness.endDate) : undefined;
		status = sickness?.status ?? 'ACTIVE';
		formErrors = { name: '' };
	}

	// untrack : seul `open` déclenche le remplissage (pas chaque rechargement de `sickness`)
	$effect(() => {
		if (open) untrack(fillFromSickness);
	});

	let formErrors = $state({ name: '' });

	// catId et sicknessId partent déjà dans les champs cachés du formulaire
	// (avant, ils étaient aussi ajoutés ici : envoyés deux fois)
	const handleEnhance: SubmitFunction = () => {
		isSaving = true;

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
	<!-- Le Trigger EST le bouton : pas de <button> dans un <button> -->
	{#if isEdit}
		<Dialog.Trigger
			class={buttonVariants({ variant: 'ghost', size: 'icon' })}
			aria-label="Modifier la maladie"
		>
			<Pencil class="h-4 w-4" />
		</Dialog.Trigger>
	{:else}
		<Dialog.Trigger class="{buttonVariants({ variant: 'outline', size: 'sm' })} rounded-2xl">
			<Plus class="mr-1 h-4 w-4" />
			Ajouter une maladie
		</Dialog.Trigger>
	{/if}

	<Dialog.Content class="sm:max-w-125">
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
