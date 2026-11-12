<script lang="ts">
	import HostAnimalsFields from '#lib/components/hosts/fields/HostAnimalsFields.svelte';
	import HostHomeFields from '#lib/components/hosts/fields/HostHomeFields.svelte';
	import HostCapacityFields from '#lib/components/hosts/fields/HostCapacityFields.svelte';
	import HostCatTypeFields from '#lib/components/hosts/fields/HostCatTypeFields.svelte';
	import HostDescriptionFields from '#lib/components/hosts/fields/HostDescriptionFields.svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { DISTRICT_OPTIONS } from '#lib/utils/districts.ts';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import SaveCancelButtons from '#lib/components/buttons/SaveCancelButtons.svelte';
	import DeleteButton from '#lib/components/buttons/DeleteButton.svelte';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import type { FormEditData, HostFormData } from '#lib/types/form.ts';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import DatePicker from '#lib/components/fields/DatePicker.svelte';

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
			<SectionCard
				icon={HOST_SECTION_CONFIG.profile.icon}
				title={HOST_SECTION_CONFIG.profile.label}
				color={HOST_SECTION_CONFIG.profile.color}
				class="@2xl:col-span-2"
			>
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<InputField
							id="firstName"
							name="firstName"
							label="Prénom"
							bind:value={editData.data.firstName}
							placeholder="Jean"
							error={formErrors.firstName}
							required
							size="sm"
						/>

						<InputField
							id="lastName"
							name="lastName"
							label="Nom"
							bind:value={editData.data.lastName}
							placeholder="Dupont"
							error={formErrors.lastName}
							required
							size="sm"
						/>
					</div>

					<DatePicker
						name="birthDate"
						value={editData.data.birthDate}
						onSelect={(date) => {
							editData.data.birthDate = date;
						}}
						label="Date de naissance"
					/>
				</div>
			</SectionCard>

			<!-- Contact -->
			<SectionCard
				icon={HOST_SECTION_CONFIG.contact.icon}
				title={HOST_SECTION_CONFIG.contact.label}
				color={HOST_SECTION_CONFIG.contact.color}
				class="@2xl:col-span-2"
			>
				<div class="grid gap-2">
					<InputField
						id="phone"
						name="phone"
						label="Téléphone"
						bind:value={editData.data.phone}
						placeholder="06 12 34 56 78"
						error={formErrors.phone}
						required
						size="sm"
					/>

					<InputField
						id="email"
						name="email"
						label="Email"
						type="email"
						bind:value={editData.email}
						placeholder="jean@example.com"
						error={formErrors.email}
						required
						size="sm"
					/>
				</div>
			</SectionCard>

			<!-- Adresse -->
			<SectionCard
				icon={HOST_SECTION_CONFIG.address.icon}
				title={HOST_SECTION_CONFIG.address.label}
				color={HOST_SECTION_CONFIG.address.color}
				class="@2xl:col-span-3"
			>
				<div class="space-y-4">
					<InputField
						id="address"
						name="address"
						label="Rue"
						bind:value={editData.data.address}
						placeholder="Adresse"
						error={formErrors.address}
						required
						size="sm"
					/>

					<div class="flex gap-4">
						<InputField
							id="city"
							name="city"
							label="Ville"
							bind:value={editData.data.city}
							placeholder="Ville"
							error={formErrors.city}
							required
							size="sm"
						/>

						<InputField
							id="postalCode"
							name="postalCode"
							label="CP"
							bind:value={editData.data.postalCode}
							placeholder="75000"
							error={formErrors.postalCode}
							required
							size="sm"
						/>

						<SelectField
							id="district"
							name="district"
							label="Quartier"
							bind:value={editData.data.district}
							options={DISTRICT_OPTIONS}
							size="sm"
						/>
					</div>
				</div>
			</SectionCard>
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
