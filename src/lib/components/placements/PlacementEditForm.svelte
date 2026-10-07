<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PlacementFull } from '$lib/types/placement';
	import type { CatFull } from '$lib/types/cat';
	import type { HostBasic } from '$lib/types/host';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Pencil } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import SelectField from '../fields/SelectField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import { PLACEMENT_STATUS, PLACEMENT_TYPE_OPTIONS } from '$lib/constants/placement';

	interface Props {
		catId: string;
		cat: CatFull;
		placement: PlacementFull;
		hosts: HostBasic;
		onSuccess?: () => void;
	}

	let { catId, cat, placement, hosts, onSuccess }: Props = $props();

	const isEdit = $derived(!!placement);

	let open = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	// État local du formulaire (hostId/catId fixes, non modifiables)
	let type = $state(placement?.type ?? 'LONG');
	let status = $state(placement?.status ?? 'ACTIVE');
	let startDate = $state<Date | undefined>(
		placement?.startDate ? new Date(placement.startDate) : undefined
	);
	let endDate = $state<Date | undefined>(
		placement?.endDate ? new Date(placement.endDate) : undefined
	);

	const handleEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;
		formData.append('catId', catId);
		if (placement?.hostId) {
			formData.append('hostId', placement.hostId);
		}
		if (isEdit && placement) {
			formData.append('placementId', placement.id);
		}

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(isEdit ? 'Placement mis à jour ✅' : 'Placement ajouté ✅');
				open = false;
				if (onSuccess) onSuccess();
			} else if (result.type === 'failure') {
				console.error('Erreur:', result.data);
				toast.error(result.data?.error || "Erreur lors de l'enregistrement");
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
		<Button variant="ghost" size="icon">
			<Pencil class="h-4 w-4" />
		</Button>
	</Dialog.Trigger>

	<Dialog.Content size="md" class="max-w-5xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				Information de {cat.name}
			</Dialog.Title>
		</Dialog.Header>

		<form method="POST" action="?/updatePlacement" use:enhance={handleEnhance} class="space-y-4">
			<input type="hidden" name="catId" value={catId} />
			{#if placement?.hostId}
				<input type="hidden" name="hostId" value={placement.hostId} />
			{/if}
			{#if isEdit && placement}
				<input type="hidden" name="placementId" value={placement.id} />
			{/if}

			<div class="text-muted-foreground space-y-2 text-sm">
				<p><span class="text-foreground font-medium">Chat :</span> {cat.name}</p>
				<p>
					<span class="text-foreground font-medium">FA :</span>
					{placement?.host?.profil?.firstName}
					{placement?.host?.profil?.lastName}
				</p>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<SelectField
					id="type"
					name="type"
					label="Type de placement"
					bind:value={type}
					options={PLACEMENT_TYPE_OPTIONS}
					size="sm"
					required
				/>

				<SelectField
					id="status"
					name="status"
					label="Statut"
					bind:value={status}
					options={PLACEMENT_STATUS}
					size="sm"
					required
				/>
			</div>

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

			<Dialog.Footer class="flex justify-between sm:justify-between">
				{#if isEdit && placement}
					<DeleteButton
						entityId={placement.id}
						lastName=""
						{isDeleting}
						{isSaving}
						showDelete={true}
						actionName="?/deletePlacement"
						fieldName="placementId"
						deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce placement ?"
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
