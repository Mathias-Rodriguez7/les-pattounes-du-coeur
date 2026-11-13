<script lang="ts">
	import PersonProfileFields from '#lib/components/person/PersonProfileFields.svelte';
	import PersonContactFields from '#lib/components/person/PersonContactFields.svelte';
	import PersonAddressFields from '#lib/components/person/PersonAddressFields.svelte';
	import HostAnimalsFields from '#lib/components/hosts/fields/HostAnimalsFields.svelte';
	import HostHomeFields from '#lib/components/hosts/fields/HostHomeFields.svelte';
	import HostCapacityFields from '#lib/components/hosts/fields/HostCapacityFields.svelte';
	import HostCatTypeFields from '#lib/components/hosts/fields/HostCatTypeFields.svelte';
	import HostDescriptionFields from '#lib/components/hosts/fields/HostDescriptionFields.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import SaveCancelButtons from '#lib/components/buttons/SaveCancelButtons.svelte';
	import DeleteButton from '#lib/components/buttons/DeleteButton.svelte';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import type { FormEditData, HostFormData } from '#lib/types/form.ts';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';

	let {
		editData = $bindable<FormEditData<HostFormData> | null>(),
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
				toast.success("Formulaire d'accueil mis à jour avec succès ! ✅");
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
		console.log('❌ Édition annulée');
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
			<!-- Profil -->
			<PersonProfileFields
				class="@2xl:col-span-2"
				bind:firstName={editData.data.firstName}
				bind:lastName={editData.data.lastName}
				bind:birthDate={editData.data.birthDate}
				errors={formErrors}
			/>

			<!-- Contact -->
			<PersonContactFields
				class="@2xl:col-span-2"
				bind:phone={editData.data.phone}
				bind:email={editData.email}
				errors={formErrors}
			/>

			<!-- Adresse -->
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

		<!-- 🏠 SECTION 2: Logement & Animaux -->
		<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-4">
			<HostHomeFields bind:data={editData.data} errors={formErrors} withStockFeed={false} />

			<HostAnimalsFields bind:data={editData.data} errors={formErrors} />

			<HostCapacityFields bind:data={editData.data} withType />

			<HostCatTypeFields bind:data={editData.data} errors={formErrors} />
		</section>

		<Separator />

		<!-- 💬 SECTION 4: Motivation -->
		<SectionCard
			icon={HOST_SECTION_CONFIG.motivation.icon}
			title={HOST_SECTION_CONFIG.motivation.label}
			color={HOST_SECTION_CONFIG.motivation.color}
		>
			<div class="space-y-4">
				<TextareaField
					id="motivation"
					name="motivation"
					label="Motivation"
					bind:value={editData.data.motivation}
					placeholder="Pourquoi souhaitez-vous accueillir un chat ?"
				/>
			</div>
		</SectionCard>

		<HostDescriptionFields bind:data={editData.data} errors={formErrors} />

		<Separator />

		<!-- 📝 SECTION 5: Notes -->
		<SectionCard
			icon={HOST_SECTION_CONFIG.notes.icon}
			title={HOST_SECTION_CONFIG.notes.label}
			color={HOST_SECTION_CONFIG.notes.color}
		>
			<TextareaField
				id="notes"
				name="notes"
				label="Notes"
				bind:value={editData.notes}
				placeholder="Remarques, points importants..."
			/>
		</SectionCard>

		<Separator />

		<!-- ✅ SECTION 6: Actions -->
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
