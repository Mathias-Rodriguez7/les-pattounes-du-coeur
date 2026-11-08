<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PlacementFull } from '$lib/types/placement';
	import type { CatFull } from '$lib/types/cat';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Pencil } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import SelectField from '../fields/SelectField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import {
		PLACEMENT_STATUS,
		PLACEMENT_TYPE_OPTIONS,
		placementHasDates
	} from '$lib/constants/placement';

	interface Props {
		cat: CatFull;
		placement: PlacementFull;
		onSuccess?: () => void;
	}

	let { cat, placement, onSuccess }: Props = $props();

	// Ids uniques : CatPanel affiche un formulaire par placement
	const uid = $props.id();

	let open = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	const catLabel = $derived(cat.name ?? cat.catNumber);
	const hostName = $derived(
		[placement.host?.profil?.firstName, placement.host?.profil?.lastName]
			.filter(Boolean)
			.join(' ') || 'cette FA'
	);

	// ===== ÉTAT DU FORMULAIRE =====
	let type = $state('LONG');
	let status = $state('ACTIVE');
	let startDate = $state<Date | undefined>();
	let endDate = $state<Date | undefined>();

	function fillFromPlacement() {
		type = placement.type;
		status = placement.status;
		startDate = placement.startDate ? new Date(placement.startDate) : undefined;
		endDate = placement.endDate ? new Date(placement.endDate) : undefined;
	}

	// À chaque ouverture, on repart des valeurs ENREGISTRÉES (pas de l'essai précédent)
	$effect(() => {
		if (open) untrack(fillFromPlacement);
	});

	const showDates = $derived(placementHasDates(type));

	// Une proposition qui devient un placement classique ou relais commence aujourd'hui
	$effect(() => {
		if (showDates && !startDate) startDate = new Date();
	});

	// ===== ENVOI =====
	const handleEnhance: SubmitFunction = () => {
		isSaving = true;

		return async ({ result, update }) => {
			isSaving = false;

			if (result.type === 'success') {
				toast.success('Placement mis à jour');
				open = false;
				await update();
				onSuccess?.();
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? "Erreur lors de l'enregistrement");
				// On garde ce qui a été saisi
				await update({ reset: false });
			} else {
				await update();
			}
		};
	};

	const handleDeleted = () => {
		open = false;
		onSuccess?.();
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon' })}
		aria-label="Modifier le placement chez {hostName}"
	>
		<Pencil class="size-4" />
	</Dialog.Trigger>

	<Dialog.Content size="md">
		<Dialog.Header>
			<Dialog.Title>Placement de {catLabel}</Dialog.Title>
			<Dialog.Description>Chez {hostName}</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/updatePlacement" use:enhance={handleEnhance} class="space-y-4">
			<!-- Seul l'id voyage : le chat et la FA d'un placement ne changent pas -->
			<input type="hidden" name="placementId" value={placement.id} />

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<SelectField
					id="{uid}-type"
					name="type"
					label="Type de placement"
					bind:value={type}
					options={PLACEMENT_TYPE_OPTIONS}
					size="sm"
					required
				/>

				<SelectField
					id="{uid}-status"
					name="status"
					label="Statut"
					bind:value={status}
					options={PLACEMENT_STATUS}
					size="sm"
					required
				/>
			</div>

			{#if showDates}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
			{/if}

			<!-- PC : une ligne | Mobile : Enregistrer au-dessus de Supprimer -->
			<Dialog.Footer class="flex-col-reverse gap-4 sm:flex-row sm:justify-between">
				<DeleteButton
					entityId={placement.id}
					firstName="le placement chez"
					lastName={hostName}
					bind:isDeleting
					{isSaving}
					showDelete={true}
					actionName="?/deletePlacement"
					fieldName="placementId"
					deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce placement ?"
					onSuccess={handleDeleted}
				/>

				<SaveCancelButtons onCancel={() => (open = false)} {isSaving} />
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
