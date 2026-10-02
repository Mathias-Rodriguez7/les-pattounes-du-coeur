<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { VolunteerEditData } from '$lib/types/volunteer';
	import {
		VOLUNTEER_STATUS_OPTIONS,
		VOLUNTEER_ROLE_OPTIONS,
		VOLUNTEER_SECTION_CONFIG
	} from '$lib/constants/volunteer';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import BlacklistButton from '../buttons/BlacklistButton.svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import SectionCard from '../cards/SectionCard.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import DateRangePicker from '../fields/DateRangePicker.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { X } from '@lucide/svelte';

	let {
		editData = $bindable<VolunteerEditData>(),
		volunteerId,
		profileId,
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
		email: '',
		phone: '',
		address: '',
		city: '',
		postalCode: ''
	});

	// ✅ DERIVED : Afficher DateRangePicker si statut = 'BREAK'
	let showBreakDateRange = $derived(editData.actif === 'BREAK');

	// Dérivés
	let districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([value, label]) => ({ value, label }))
	);

	// Handlers
	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;

		formData.append('volunteerId', volunteerId || '');

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('la Bénévole mis à jour avec succès ! ✅');
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

	// ✅ Handler pour la plage de dates
	const handleBreakDateRangeSelect = (dates: { start: Date; end: Date }) => {
		editData.breakStartDate = dates.start;
		editData.breakEndDate = dates.end;
	};
</script>

<!-- ✅ FORMULAIRE UPDATE -->
<form method="POST" action="?/updateVolunteer" use:enhance={handleUpdateEnhance} class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">
			Éditer la FA: {editData.firstName || 'Sans nom'}
			{editData.lastName || 'Sans nom'}
		</h2>

		<Button variant="ghost" size="icon" onclick={handleCancelClick}>
			<X class="h-5 w-5" />
		</Button>
	</div>
	<section class="grid grid-cols-2 gap-4">
		<!-- Statu -->
		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.statuts.icon}
			title={VOLUNTEER_SECTION_CONFIG.statuts.label}
			color={VOLUNTEER_SECTION_CONFIG.statuts.color}
		>
			<div class="grid grid-cols-2 gap-4">
				<SelectField
					id="actif"
					name="actif"
					label="Statut activité"
					bind:value={editData.actif}
					options={VOLUNTEER_STATUS_OPTIONS}
					size="sm"
					required
				/>

				<SelectField
					id="role"
					name="role"
					label="Rôle"
					bind:value={editData.role}
					options={VOLUNTEER_ROLE_OPTIONS}
					size="sm"
					required
				/>

				<!-- ✅ AFFICHAGE CONDITIONNEL : DateRangePicker apparaît si statut = 'BREAK' -->
				{#if showBreakDateRange}
					<div class="col-span-2">
						<DateRangePicker
							startValue={editData.breakStart}
							endValue={editData.breakEnd}
							startName="breakStart"
							endName="breakEnd"
							label="Période de congé"
							onSelect={handleBreakDateRangeSelect}
						/>
					</div>
				{/if}
			</div>
		</SectionCard>

		<!-- Profil -->
		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.profile.icon}
			title={VOLUNTEER_SECTION_CONFIG.profile.label}
			color={VOLUNTEER_SECTION_CONFIG.profile.color}
		>
			<div class="grid grid-cols-2 gap-4">
				<InputField
					id="firstName"
					name="firstName"
					label="Prénom"
					bind:value={editData.firstName}
					error={formErrors.firstName}
					size="sm"
					required
				/>

				<InputField
					id="lastName"
					name="lastName"
					label="Nom"
					bind:value={editData.lastName}
					error={formErrors.lastName}
					size="sm"
					required
				/>

				<DatePicker
					name="birthDate"
					value={editData.birthDate}
					onSelect={(date) => (editData.birthDate = date)}
					label="Date de naissance"
				/>
			</div>
		</SectionCard>
	</section>
	<Separator />

	<section class="grid grid-cols-2 gap-4">
		<!-- Adresse -->
		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.address.icon}
			title={VOLUNTEER_SECTION_CONFIG.address.label}
			color={VOLUNTEER_SECTION_CONFIG.address.color}
		>
			<div class="space-y-4">
				<InputField
					id="address"
					name="address"
					label="Rue"
					bind:value={editData.address}
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
						bind:value={editData.city}
						placeholder="Ville"
						error={formErrors.city}
						required
						size="sm"
					/>

					<InputField
						id="postalCode"
						name="postalCode"
						label="Code postal"
						bind:value={editData.postalCode}
						placeholder="75000"
						error={formErrors.postalCode}
						required
						size="sm"
					/>

					<SelectField
						id="district"
						name="district"
						label="Quartier"
						bind:value={editData.district}
						options={districtOptions}
						size="sm"
					/>
				</div>
			</div>
		</SectionCard>

		<!-- Contact -->
		<SectionCard
			icon={VOLUNTEER_SECTION_CONFIG.contact.icon}
			title={VOLUNTEER_SECTION_CONFIG.contact.label}
			color={VOLUNTEER_SECTION_CONFIG.contact.color}
		>
			<div class="grid gap-2">
				<InputField
					id="phone"
					name="phone"
					label="Téléphone"
					bind:value={editData.phone}
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
	</section>

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
				entityId={profileId}
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
