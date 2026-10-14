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
		VOLUNTEER_SECTION_CONFIG,
		VOLUNTEER_AVAILABILITY_OPTIONS,
		VOLUNTEER_AVAILABILITY_DURATION_OPTIONS
	} from '$lib/constants/volunteer';
	import type { FormEditData, VolunteerFormData } from '$lib/types/form';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';

	let {
		editData = $bindable<FormEditData<VolunteerFormData> | null>(),
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
	<form method="POST" action="?/updateForm" use:enhance={handleUpdateEnhance} class="space-y-6">
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
			<SectionCard
				icon={VOLUNTEER_SECTION_CONFIG.profile.icon}
				title={VOLUNTEER_SECTION_CONFIG.profile.label}
				color={VOLUNTEER_SECTION_CONFIG.profile.color}
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
						label="Date de naissance"
					/>
				</div>
			</SectionCard>

			<SectionCard
				icon={VOLUNTEER_SECTION_CONFIG.contact.icon}
				title={VOLUNTEER_SECTION_CONFIG.contact.label}
				color={VOLUNTEER_SECTION_CONFIG.contact.color}
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
				icon={VOLUNTEER_SECTION_CONFIG.address.icon}
				title={VOLUNTEER_SECTION_CONFIG.address.label}
				color={VOLUNTEER_SECTION_CONFIG.address.color}
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

		<!-- 🏆 SECTION 2: Expérience & Disponibilités -->
		<section class="grid grid-cols-3 gap-4">
			<SectionCard
				icon={VOLUNTEER_SECTION_CONFIG.experience.icon}
				title={VOLUNTEER_SECTION_CONFIG.experience.label}
				color={VOLUNTEER_SECTION_CONFIG.experience.color}
			>
				<div class="space-y-4">
					<CheckboxField
						id="hasCatExperience"
						name="hasCatExperience"
						label="Expérience avec des chats"
						checked={editData.data.hasCatExperience}
						onChange={(value) => {
							editData.data.hasCatExperience = value;
							if (!value) editData.data.catExperienceDescription = undefined;
						}}
					/>

					<CheckboxField
						id="hasAssociationExperience"
						name="hasAssociationExperience"
						label="Expérience avec des associations"
						checked={editData.data.hasAssociationExperience}
						onChange={(value) => {
							editData.data.hasAssociationExperience = value;
							if (!value) editData.data.associationExperienceDescription = undefined;
						}}
					/>

					<CheckboxField
						id="hasMedicalCareExperience"
						name="hasMedicalCareExperience"
						label="Expérience de soins"
						checked={editData.data.hasMedicalCareExperience}
						onChange={(value) => {
							editData.data.hasMedicalCareExperience = value;
							if (!value) editData.data.medicalCareDescription = undefined;
						}}
					/>

					<CheckboxField
						id="hasTransportExperience"
						name="hasTransportExperience"
						label="Expérience transport animaux"
						checked={editData.data.hasTransportExperience}
						onChange={(value) => (editData.data.hasTransportExperience = value)}
					/>
				</div>
			</SectionCard>

			<SectionCard
				icon={VOLUNTEER_SECTION_CONFIG.infos.icon}
				title={VOLUNTEER_SECTION_CONFIG.infos.label}
				color={VOLUNTEER_SECTION_CONFIG.infos.color}
			>
				<div class="space-y-4">
					<CheckboxField
						id="car"
						name="car"
						label="Voiture"
						checked={editData.data.car}
						onChange={(value) => (editData.data.car = value)}
					/>

					<CheckboxField
						id="canHelpWeekdays"
						name="canHelpWeekdays"
						label="Disponible en semaine"
						checked={editData.data.canHelpWeekdays}
						onChange={(value) => (editData.data.canHelpWeekdays = value)}
					/>

					<CheckboxField
						id="canHelpWeekends"
						name="canHelpWeekends"
						label="Disponible le weekend"
						checked={editData.data.canHelpWeekends}
						onChange={(value) => (editData.data.canHelpWeekends = value)}
					/>

					<CheckboxField
						id="canHelpEmergencies"
						name="canHelpEmergencies"
						label="Peut aider en cas d'urgence"
						checked={editData.data.canHelpEmergencies}
						onChange={(value) => (editData.data.canHelpEmergencies = value)}
					/>
				</div>
			</SectionCard>

			<SectionCard
				icon={VOLUNTEER_SECTION_CONFIG.availability.icon}
				title={VOLUNTEER_SECTION_CONFIG.availability.label}
				color={VOLUNTEER_SECTION_CONFIG.availability.color}
			>
				<div class="grid gap-4">
					<SelectField
						id="availability"
						name="availability"
						label="Implication dans l'association"
						bind:value={editData.data.availability}
						options={VOLUNTEER_AVAILABILITY_OPTIONS}
						size="sm"
					/>

					<SelectField
						id="availabilityDuration"
						name="availabilityDuration"
						label="Temps de collaboration"
						bind:value={editData.data.availabilityDuration}
						options={VOLUNTEER_AVAILABILITY_DURATION_OPTIONS}
						size="sm"
					/>
				</div>
			</SectionCard>
		</section>

		<Separator />

		<!-- 💬 SECTION 3: Textes -->

		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.experience.icon}
			title={VOLUNTEER_SECTION_CONFIG.experience.label}
			color={VOLUNTEER_SECTION_CONFIG.experience.color}
		>
			<div class="space-y-2">
				{#if editData.data.hasCatExperience}
					<TextareaField
						id="catExperienceDescription"
						name="catExperienceDescription"
						label="Décrivez votre expérience"
						bind:value={editData.data.catExperienceDescription}
						placeholder="Nombre de chats, durée, type de soins..."
					/>
				{/if}
			</div>

			<div class="space-y-2">
				{#if editData.data.hasAssociationExperience}
					<TextareaField
						id="associationExperienceDescription"
						name="associationExperienceDescription"
						label="Décrivez votre expérience"
						bind:value={editData.data.associationExperienceDescription}
						placeholder="Nom de l'association, rôle, durée..."
					/>
				{/if}
			</div>

			<div class="space-y-2">
				{#if editData.data.hasMedicalCareExperience}
					<TextareaField
						id="medicalCareDescription"
						name="medicalCareDescription"
						label="Décrivez votre expérience"
						bind:value={editData.data.medicalCareDescription}
						placeholder="Type de soins, formation..."
					/>
				{/if}
			</div>
		</SectionCard>

		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.capacity.icon}
			title={VOLUNTEER_SECTION_CONFIG.capacity.label}
			color={VOLUNTEER_SECTION_CONFIG.capacity.color}
		>
			<TextareaField
				id="skills"
				name="skills"
				bind:value={editData.data.skills}
				placeholder="Compétences, savoir-faire..."
			/>
		</SectionCard>

		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.motivation.icon}
			title={VOLUNTEER_SECTION_CONFIG.motivation.label}
			color={VOLUNTEER_SECTION_CONFIG.motivation.color}
		>
			<TextareaField
				id="motivation"
				name="motivation"
				bind:value={editData.data.motivation}
				placeholder="Pourquoi souhaitez-vous devenir bénévole ?"
			/>
		</SectionCard>

		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.additionalInformation.icon}
			title={VOLUNTEER_SECTION_CONFIG.additionalInformation.label}
			color={VOLUNTEER_SECTION_CONFIG.additionalInformation.color}
		>
			<TextareaField
				id="additionalInformation"
				name="additionalInformation"
				bind:value={editData.data.additionalInformation}
				placeholder="Autres informations utiles..."
			/>
		</SectionCard>

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
				<BlacklistButton
					profileId=""
					firstName={editData.data.firstName}
					lastName={editData.data.lastName}
					email=""
					{isBlacklisting}
					{isSaving}
					{isDeleting}
					showBlacklist={false}
					actionName="?/blacklistVolunteerForm"
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
