<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';
	import CheckboxField from '$lib/components/fields/CheckboxField.svelte';
	import SaveCancelButtons from '$lib/components/buttons/SaveCancelButtons.svelte';
	import DeleteButton from '$lib/components/buttons/DeleteButton.svelte';
	import BlacklistButton from '$lib/components/buttons/BlacklistButton.svelte';
	import {
		ADOPTION_AGE_OPTIONS,
		ADOPTION_SEX_OPTIONS,
		ADOPTION_FUR_OPTIONS,
		ADOPTION_SECTION_CONFIG
	} from '$lib/constants/forms';
	import type { FormEditData, AdoptionFormData } from '$lib/types/form';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';

	let {
		editData = $bindable<FormEditData<AdoptionFormData> | null>(),
		formId = '',
		onSuccess,
		onCancel
	} = $props();

	// États
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let isBlacklisting = $state(false);

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
				toast.success('Formulaire adoption mis à jour avec succès ! ✅');
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

	const handleBlacklisted = () => {
		isBlacklisting = false;
		if (onSuccess) {
			onSuccess();
		}
	};

	let districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([value, label]) => ({ value, label }))
	);
</script>

{#if editData && editData.data}
	<form
		method="POST"
		action="?/updateAdoptionForm"
		use:enhance={handleUpdateEnhance}
		class="space-y-6"
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
		<section class="grid grid-cols-7 gap-4">
			<!-- Profil Candidat -->
			<SectionCard
				icon={ADOPTION_SECTION_CONFIG.profile.icon}
				title={ADOPTION_SECTION_CONFIG.profile.label}
				color={ADOPTION_SECTION_CONFIG.profile.color}
				class="col-span-2"
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
						label="Date d'anniversaire"
					/>
				</div>
			</SectionCard>

			<!-- Contact -->
			<SectionCard
				icon={ADOPTION_SECTION_CONFIG.contact.icon}
				title={ADOPTION_SECTION_CONFIG.contact.label}
				color={ADOPTION_SECTION_CONFIG.contact.color}
				class="col-span-2"
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

			<SectionCard
				icon={ADOPTION_SECTION_CONFIG.address.icon}
				title={ADOPTION_SECTION_CONFIG.address.label}
				color={ADOPTION_SECTION_CONFIG.address.color}
				class="col-span-3"
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
							options={districtOptions}
							size="sm"
						/>
					</div>
				</div>
			</SectionCard>
		</section>

		<Separator />

		<!-- 🐱 SECTION 3: Chat Recherché -->
		<section class="grid gap-4">
			<SectionCard
				icon={ADOPTION_SECTION_CONFIG.cat.icon}
				title={ADOPTION_SECTION_CONFIG.cat.label}
				color={ADOPTION_SECTION_CONFIG.cat.color}
			>
				<div class="grid gap-4">
					<div class="grid grid-cols-4 gap-2">
						<SelectField
							id="catAge"
							name="catAge"
							label="Âge du chat"
							bind:value={editData.data.catAge}
							options={ADOPTION_AGE_OPTIONS}
							size="sm"
							required
						/>

						<SelectField
							id="catSex"
							name="catSex"
							label="Sexe"
							bind:value={editData.data.catSex}
							options={ADOPTION_SEX_OPTIONS}
							size="sm"
							required
						/>

						<InputField
							id="color"
							name="color"
							label="Couleur"
							bind:value={editData.data.color}
							placeholder="Roux, noir, etc."
							size="sm"
						/>

						<SelectField
							id="furLength"
							name="furLength"
							label="Longueur du poil"
							bind:value={editData.data.furLength}
							options={ADOPTION_FUR_OPTIONS}
							size="sm"
							required
						/>
					</div>
					<TextareaField
						id="temperament"
						name="temperament"
						label="Caractère recherché"
						bind:value={editData.data.temperament}
						placeholder="Décrivez le caractère recherché..."
					/>
				</div>
			</SectionCard>
		</section>

		<Separator />

		<!-- 🏠 SECTION 4: Logement -->
		<section class="grid grid-cols-3 gap-4">
			<SectionCard
				icon={ADOPTION_SECTION_CONFIG.home.icon}
				title={ADOPTION_SECTION_CONFIG.home.label}
				color={ADOPTION_SECTION_CONFIG.home.color}
				class="col-span-1"
			>
				<div class="space-y-4">
					<InputField
						id="housingSize"
						name="housingSize"
						label="Taille du logement (m²)"
						type="number"
						bind:value={editData.data.housingSize}
						placeholder="60"
						required
						size="sm"
					/>

					<CheckboxField
						id="hasGarden"
						name="hasGarden"
						label="Extérieur / Jardin"
						checked={editData.data.hasGarden}
						onChange={(value) => {
							editData.data.hasGarden = value;
							if (!value) {
								editData.data.gardenSize = undefined;
							}
						}}
					/>

					{#if editData.data.hasGarden}
						<InputField
							id="gardenSize"
							name="gardenSize"
							label="Taille de l'exterieur (m²)"
							type="number"
							bind:value={editData.data.gardenSize}
							placeholder="100"
							size="sm"
						/>
					{/if}
				</div>
			</SectionCard>

			<!-- 🐾 Animaux et Enfants -->
			<SectionCard
				icon={ADOPTION_SECTION_CONFIG.foyer.icon}
				title={ADOPTION_SECTION_CONFIG.foyer.label}
				color={ADOPTION_SECTION_CONFIG.foyer.color}
				class="col-span-2"
			>
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-2">
						<CheckboxField
							id="hasPets"
							name="hasPets"
							label="Animaux actuels"
							checked={editData.data.hasPets}
							onChange={(value) => (editData.data.hasPets = value)}
						/>

						<InputField
							id="numberOfChildren"
							name="numberOfChildren"
							label="Nombre d'enfants"
							type="number"
							bind:value={editData.data.numberOfChildren}
							placeholder="0"
							size="sm"
						/>
					</div>

					{#if editData.data.hasPets}
						<div class="flex gap-2">
							<InputField
								id="numberOfCats"
								name="numberOfCats"
								label="Chats"
								type="number"
								bind:value={editData.data.numberOfCats}
								placeholder="0"
								size="sm"
							/>

							<InputField
								id="numberOfDogs"
								name="numberOfDogs"
								label="Chiens"
								type="number"
								bind:value={editData.data.numberOfDogs}
								placeholder="0"
								size="sm"
							/>
						</div>

						<TextareaField
							id="otherPets"
							name="otherPets"
							label="Autres animaux"
							bind:value={editData.data.otherPets}
							placeholder="Autres animaux..."
						/>
					{/if}
				</div>
			</SectionCard>
		</section>

		<Separator />

		<!-- 📝 SECTION 5: Notes -->
		<SectionCard
			icon={ADOPTION_SECTION_CONFIG.notes.icon}
			title={ADOPTION_SECTION_CONFIG.notes.label}
			color={ADOPTION_SECTION_CONFIG.notes.color}
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

		<!-- ✅ SECTION 6: Actions (Boutons) -->
		<section class="flex justify-between">
			<div class="flex gap-4">
				<BlacklistButton
					profileId=""
					firstName={editData.data.firstName}
					lastName={editData.data.lastName}
					email=""
					{isBlacklisting}
					{isSaving}
					{isDeleting}
					showBlacklist={false}
					actionName="?/blacklistAdoptionForm"
					buttonLabel="Ajouter à la liste noire"
					onSuccess={handleBlacklisted}
				/>

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
