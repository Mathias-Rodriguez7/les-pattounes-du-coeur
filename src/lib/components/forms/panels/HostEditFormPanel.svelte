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
		HOST_SECTION_CONFIG,
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS
	} from '$lib/constants/host';
	import type { FormEditData, HostFormData } from '$lib/types/form';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';

	let {
		editData = $bindable<FormEditData<HostFormData> | null>(),
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
			<!-- Profil -->
			<SectionCard
				icon={HOST_SECTION_CONFIG.profile.icon}
				title={HOST_SECTION_CONFIG.profile.label}
				color={HOST_SECTION_CONFIG.profile.color}
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

			<!-- Contact -->
			<SectionCard
				icon={HOST_SECTION_CONFIG.contact.icon}
				title={HOST_SECTION_CONFIG.contact.label}
				color={HOST_SECTION_CONFIG.contact.color}
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

			<!-- Adresse -->
			<SectionCard
				icon={HOST_SECTION_CONFIG.address.icon}
				title={HOST_SECTION_CONFIG.address.label}
				color={HOST_SECTION_CONFIG.address.color}
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

		<!-- 🏠 SECTION 2: Logement & Animaux -->
		<section class="grid grid-cols-4 gap-4">
			<SectionCard
				icon={HOST_SECTION_CONFIG.home.icon}
				title={HOST_SECTION_CONFIG.home.label}
				color={HOST_SECTION_CONFIG.home.color}
			>
				<div class="space-y-4">
					<InputField
						id="space"
						name="space"
						label="Surface (m²)"
						type="number"
						bind:value={editData.data.space}
						placeholder="60"
						required
						size="sm"
					/>

					<CheckboxField
						id="outside"
						name="outside"
						label="Extérieur / Jardin"
						checked={editData.data.outside}
						onChange={(value) => {
							editData.data.outside = value;
							if (!value) {
								editData.data.outsideDescription = undefined;
							}
						}}
					/>

					<CheckboxField
						id="car"
						name="car"
						label="Voiture"
						checked={editData.data.car}
						onChange={(value) => (editData.data.car = value)}
					/>
				</div>
			</SectionCard>

			<SectionCard
				icon={HOST_SECTION_CONFIG.animals.icon}
				title={HOST_SECTION_CONFIG.animals.label}
				color={HOST_SECTION_CONFIG.animals.color}
			>
				<div class="space-y-4">
					<CheckboxField
						id="hasAnimalsAtHome"
						name="hasAnimalsAtHome"
						label="Animaux dans le foyer"
						checked={editData.data.hasAnimalsAtHome}
						onChange={(value) => {
							editData.data.hasAnimalsAtHome = value;
							if (!value) {
								editData.data.numberOfCatsAtHome = undefined;
								editData.data.numberOfDogsAtHome = undefined;
								editData.data.otherAnimalsAtHome = undefined;
							}
						}}
					/>

					{#if editData.data.hasAnimalsAtHome}
						<InputField
							id="numberOfCatsAtHome"
							name="numberOfCatsAtHome"
							label="🐱 Chats"
							type="number"
							bind:value={editData.data.numberOfCatsAtHome}
							placeholder="0"
							size="sm"
						/>

						<InputField
							id="numberOfDogsAtHome"
							name="numberOfDogsAtHome"
							label="🐕 Chiens"
							type="number"
							bind:value={editData.data.numberOfDogsAtHome}
							placeholder="0"
							size="sm"
						/>

						<TextareaField
							id="otherAnimalsAtHome"
							name="otherAnimalsAtHome"
							label="🐾 Autres"
							bind:value={editData.data.otherAnimalsAtHome}
							placeholder="Lapin..."
						/>
					{/if}
				</div>
			</SectionCard>

			<SectionCard
				icon={HOST_SECTION_CONFIG.capacity.icon}
				title={HOST_SECTION_CONFIG.capacity.label}
				color={HOST_SECTION_CONFIG.capacity.color}
			>
				<div class="grid gap-4">
					<SelectField
						id="type"
						name="type"
						label="Type d'accueil"
						bind:value={editData.data.type}
						options={HOST_TYPE_OPTIONS}
						size="sm"
						required
					/>

					<SelectField
						id="heal"
						name="heal"
						label="Soins"
						bind:value={editData.data.heal}
						options={HOST_HEAL_OPTIONS}
						size="sm"
					/>

					<SelectField
						id="socialize"
						name="socialize"
						label="Socialisation"
						bind:value={editData.data.socialize}
						options={HOST_SOCIALIZE_OPTIONS}
						size="sm"
					/>

					<SelectField
						id="babyFeeding"
						name="babyFeeding"
						label="Biberonnage"
						bind:value={editData.data.babyFeeding}
						options={HOST_BABY_FEEDING_OPTIONS}
						size="sm"
					/>
				</div>
			</SectionCard>

			<SectionCard
				icon={HOST_SECTION_CONFIG.cat.icon}
				title={HOST_SECTION_CONFIG.cat.label}
				color={HOST_SECTION_CONFIG.cat.color}
			>
				<div class="grid gap-4">
					<InputField
						id="catAdult"
						name="catAdult"
						label="Chats adultes"
						type="number"
						bind:value={editData.data.catAdult}
						placeholder="1"
						size="sm"
					/>

					<CheckboxField
						id="kittyAndKitten"
						name="kittyAndKitten"
						label="Chatte avec portée"
						checked={editData.data.kittyAndKitten}
						onChange={(value) => {
							editData.data.kittyAndKitten = value;
							if (!value) {
								editData.data.kitten = undefined;
							}
						}}
					/>

					<InputField
						id="kitten"
						name="kitten"
						label="Nombre de chatons"
						type="number"
						bind:value={editData.data.kitten}
						placeholder="0"
						size="sm"
					/>
				</div>
			</SectionCard>
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

		<SectionCard
			icon={HOST_SECTION_CONFIG.homeDescription.icon}
			title={HOST_SECTION_CONFIG.homeDescription.label}
			color={HOST_SECTION_CONFIG.homeDescription.color}
		>
			<div class="space-y-4">
				<TextareaField
					id="homeDescription"
					name="homeDescription"
					label="Description du logement"
					bind:value={editData.data.homeDescription}
					placeholder="Décrivez le logement..."
				/>
			</div>
		</SectionCard>

		<SectionCard
			icon={HOST_SECTION_CONFIG.outsideDescription.icon}
			title={HOST_SECTION_CONFIG.outsideDescription.label}
			color={HOST_SECTION_CONFIG.outsideDescription.color}
		>
			<div class="space-y-4">
				<TextareaField
					id="outsideDescription"
					name="outsideDescription"
					label="Description de l'exterieur"
					bind:value={editData.data.outsideDescription}
					placeholder="Décrivez le logement..."
				/>
			</div>
		</SectionCard>

		<SectionCard
			icon={HOST_SECTION_CONFIG.presence.icon}
			title={HOST_SECTION_CONFIG.presence.label}
			color={HOST_SECTION_CONFIG.presence.color}
		>
			<div class="space-y-4">
				<TextareaField
					id="presence"
					name="presence"
					label="Présence"
					bind:value={editData.data.presence}
					placeholder="Disponibilité, présence au domicile..."
				/>
			</div>
		</SectionCard>

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
				<BlacklistButton
					profileId=""
					firstName={editData.data.firstName}
					lastName={editData.data.lastName}
					email=""
					{isBlacklisting}
					{isSaving}
					{isDeleting}
					showBlacklist={false}
					actionName="?/blacklistHostForm"
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
