<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { VolunteerEditFormProps } from '$lib/types/volunteer';
	import { VOLUNTEER_STATUS_OPTIONS, VOLUNTEER_ROLE_OPTIONS } from '$lib/constants/volunteer';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import BlacklistButton from '../buttons/BlacklistButton.svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import HiddenVolunteerFields from './HiddenVolunteerFields.svelte';

	let {
		editData = $bindable(),
		volunteerId,
		profileId,
		onSuccess,
		onCancel
	}: VolunteerEditFormProps = $props();

	// États
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let isBlacklisting = $state(false);

	// Dérivés
	let isDisabled = $derived(isSaving || isDeleting || isBlacklisting);
	let districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([value, label]) => ({ value, label }))
	);

	// Handlers
	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;

		console.log('📤 volunteerId avant envoi:', volunteerId);
		formData.append('volunteerId', volunteerId || '');

		return async ({ result, update }) => {
			console.log('📥 Réponse du serveur:', result);

			if (result.type === 'success') {
				console.log('✅ Données retournées:', result.data);

				// 🔑 IMPORTANT: Mettre à jour editData avec les données du serveur
				if (result.data?.data?.volunteer) {
					const updated = result.data.data.volunteer;
					editData.firstName = updated.profil?.firstName || editData.firstName;
					editData.lastName = updated.profil?.lastName || editData.lastName;
					editData.email = updated.profil?.email || editData.email;
					editData.phone = updated.profil?.phone || editData.phone;
					editData.address = updated.profil?.address || editData.address;
					editData.city = updated.profil?.city || editData.city;
					editData.postalCode = updated.profil?.postalCode || editData.postalCode;
					editData.district = updated.profil?.district || editData.district;
					editData.actif = updated.actif || editData.actif;
					editData.role = updated.role || editData.role;

					console.log('✅ editData mis à jour:', editData);
				}

				toast.success('Bénévole mis à jour avec succès ! ✅');
				onSuccess?.();
			} else if (result.type === 'failure') {
				console.error('❌ Erreur mise à jour:', result.data);
				toast.error(result.data?.error || 'Erreur lors de la mise à jour');
			}

			await update();
			isSaving = false;
		};
	};

	const handleCancelClick = () => {
		console.log('❌ Édition annulée');
		onCancel?.();
	};

	const handleDeleted = () => {
		isDeleting = false;
		onSuccess?.();
	};

	const handleBlacklisted = () => {
		isBlacklisting = false;
		onSuccess?.();
	};
</script>

<!-- ✅ FORMULAIRE UPDATE -->
<form method="POST" action="?/updateVolunteer" use:enhance={handleUpdateEnhance} class="space-y-6">
	<!-- 🔑 COMPOSANT HIDDEN FIELDS -->
	<HiddenVolunteerFields {editData} />
	<!-- SECTION 1: CONTACT -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Contact</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<InputField
				id="firstname-input"
				label="Prénom"
				bind:value={editData.firstName}
				placeholder="Jean"
				disabled={isDisabled}
				required
			/>

			<InputField
				id="lastname-input"
				label="Nom"
				bind:value={editData.lastName}
				placeholder="Dupont"
				disabled={isDisabled}
				required
			/>

			<InputField
				id="email-input"
				label="Email"
				type="email"
				bind:value={editData.email}
				placeholder="jean@example.com"
				disabled={isDisabled}
				required
			/>

			<InputField
				id="phone-input"
				label="Téléphone"
				type="tel"
				bind:value={editData.phone}
				placeholder="06 12 34 56 78"
				disabled={isDisabled}
			/>
		</div>
	</div>

	<Separator />

	<!-- SECTION 2: STATUT ET RÔLE -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Statut et Rôle</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<SelectField
				id="status-select"
				label="Statut"
				bind:value={editData.actif}
				options={VOLUNTEER_STATUS_OPTIONS}
				disabled={isDisabled}
				required
			/>

			<SelectField
				id="role-select"
				label="Rôle"
				bind:value={editData.role}
				options={VOLUNTEER_ROLE_OPTIONS}
				disabled={isDisabled}
				required
			/>
		</div>
	</div>

	<Separator />

	<!-- SECTION 3: LOCALISATION -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Localisation</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<InputField
				id="address-input"
				label="Adresse"
				bind:value={editData.address}
				placeholder="123 rue de la Paix"
				disabled={isDisabled}
			/>

			<InputField
				id="city-input"
				label="Ville"
				bind:value={editData.city}
				placeholder="Paris"
				disabled={isDisabled}
			/>

			<InputField
				id="postalcode-input"
				label="Code postal"
				bind:value={editData.postalCode}
				placeholder="75001"
				disabled={isDisabled}
			/>

			<SelectField
				id="district-select"
				label="Quartier"
				bind:value={editData.district}
				options={districtOptions}
				disabled={isDisabled}
			/>
		</div>
	</div>

	<Separator />

	<!-- ✅ SECTION 4: BOUTONS ACTION -->
	<section class="flex justify-between">
		<div class="flex gap-4">
			<BlacklistButton
				{profileId}
				firstName={editData.firstName}
				lastName={editData.lastName}
				email={editData.email}
				{isBlacklisting}
				{isSaving}
				{isDeleting}
				showBlacklist={true}
				actionName="?/blacklistVolunteer"
				buttonLabel="Ajouter à la liste noire"
				onSuccess={handleBlacklisted}
			/>

			<DeleteButton
				{profileId}
				firstName={editData.firstName}
				lastName={editData.lastName}
				{isDeleting}
				{isSaving}
				showDelete={true}
				deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce bénévole ?"
				onSuccess={handleDeleted}
			/>
		</div>
		<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
	</section>
</form>
