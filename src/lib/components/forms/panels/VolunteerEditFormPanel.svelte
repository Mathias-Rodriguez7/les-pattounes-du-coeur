<script lang="ts">
	import VolunteerExperienceFields from '#lib/components/volunteers/fields/VolunteerExperienceFields.svelte';
	import VolunteerAvailabilityFields from '#lib/components/volunteers/fields/VolunteerAvailabilityFields.svelte';
	import VolunteerExperienceDescriptions from '#lib/components/volunteers/fields/VolunteerExperienceDescriptions.svelte';
	import VolunteerMotivationFields from '#lib/components/volunteers/fields/VolunteerMotivationFields.svelte';
	import PersonProfileFields from '#lib/components/person/PersonProfileFields.svelte';
	import PersonContactFields from '#lib/components/person/PersonContactFields.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import SaveCancelButtons from '#lib/components/buttons/SaveCancelButtons.svelte';
	import DeleteButton from '#lib/components/buttons/DeleteButton.svelte';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import type { FormEditData, VolunteerFormData } from '#lib/types/form.ts';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';

	let {
		editData = $bindable<FormEditData<VolunteerFormData> | null>(),
		formId = '',
		/** Le bouton « Blacklister » n'est proposé qu'à l'admin… */
		isAdmin = false,
		/** …et seulement si l'email n'y est pas déjà */
		isBlacklisted = false,
		onSuccess,
		onCancel
	} = $props();

	// États
	let isSaving = $state(false);
	let isDeleting = $state(false);

	let formErrors = $state({
		firstName: '',
		lastName: '',
		phone: '',
		email: '',
		address: '',
		city: '',
		postalCode: ''
	});

	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;

		formData.append('formId', formId || '');

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Formulaire bénévole mis à jour avec succès ! ✅');
				if (onSuccess) {
					onSuccess();
				}
			} else if (result.type === 'failure') {
				console.error('Erreur mise à jour:', result.data);
				toast.error(result.data?.error || 'Erreur lors de la mise à jour');
			}

			await update();
			isSaving = false;
		};
	};

	const handleCancelClick = () => {
		if (onCancel) {
			onCancel();
		}
	};

	const handleDeleted = () => {
		isDeleting = false;
		if (onSuccess) {
			onSuccess();
		}
	};
</script>

{#if editData && editData.data}
	<form
		method="POST"
		action="?/updateForm"
		use:enhance={handleUpdateEnhance}
		class="@container space-y-6"
	>
		<!-- 🔑 HIDDEN INPUTS -->
		<input type="hidden" name="formId" value={formId} />
		<input type="hidden" name="status" value={editData.status} />

		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">
				Éditer: {editData.data.firstName || 'Sans nom'}
				{editData.data.lastName || 'Sans nom'}
			</h2>

			<Button variant="ghost" size="icon" onclick={handleCancelClick}>
				<X class="h-5 w-5" />
			</Button>
		</div>

		<!-- 📋 SECTION 1: Infos Personnelles -->
		<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-7">
			<PersonProfileFields
				class="@2xl:col-span-2"
				bind:firstName={editData.data.firstName}
				bind:lastName={editData.data.lastName}
				bind:birthDate={editData.data.birthDate}
				errors={formErrors}
			/>

			<PersonContactFields
				class="@2xl:col-span-2"
				bind:phone={editData.data.phone}
				bind:email={editData.email}
				errors={formErrors}
			/>

			<PersonAddressFields
				class="@2xl:col-span-3"
				bind:address={editData.data.address}
				bind:city={editData.data.city}
				bind:postalCode={editData.data.postalCode}
				bind:district={editData.data.district}
				errors={formErrors}
			/>
		</section>

		<Separator />

		<!-- 🏆 SECTION 2: Expérience & Disponibilités -->
		<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-3">
			<VolunteerExperienceFields bind:data={editData.data} />

			<VolunteerAvailabilityFields bind:data={editData.data} />
		</section>

		<Separator />

		<!-- 💬 SECTION 3: Textes -->
		<VolunteerExperienceDescriptions bind:data={editData.data} />

		<VolunteerMotivationFields bind:data={editData.data} />

		<Separator />

		<!-- 📝 SECTION 4: Notes -->
		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.notes.icon}
			title={VOLUNTEER_SECTION_CONFIG.notes.label}
			color={VOLUNTEER_SECTION_CONFIG.notes.color}
		>
			<TextareaField
				id="notes"
				name="notes"
				bind:value={editData.notes}
				placeholder="Remarques, points importants..."
			/>
		</SectionCard>

		<Separator />

		<!-- ✅ SECTION 5: Actions -->
		<section class="flex justify-between">
			<div class="flex gap-4">
				{#if isAdmin && !isBlacklisted}
					<BlacklistAddDialog
						email={editData.email}
						name={`${editData.data.firstName ?? ''} ${editData.data.lastName ?? ''}`.trim() || null}
						trigger="button"
						onSuccess={() => onSuccess?.()}
					/>
				{/if}
				<DeleteButton
					entityId={formId}
					firstName={editData.data.firstName}
					lastName={editData.data.lastName}
					{isDeleting}
					{isSaving}
					showDelete={true}
					deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce formulaire ?"
					onSuccess={handleDeleted}
				/>
			</div>

			<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
		</section>
	</form>
{/if}
