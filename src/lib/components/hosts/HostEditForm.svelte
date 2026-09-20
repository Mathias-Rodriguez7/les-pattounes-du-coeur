<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import BlacklistButton from '../buttons/BlacklistButton.svelte';
	import {
		HOST_ACTIF_OPTIONS,
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS,
		HOST_SECTION_CONFIG
	} from '$lib/constants/host';
	import SectionCard from '../cards/SectionCard.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import type { HostEditData } from '$lib/server/hosts/schemas';

	let {
		editData = $bindable<HostEditData>(),
		hostId = '',
		profileId = '',
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

	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;

		formData.append('hostId', hostId || '');

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success("la Famille d'accueil mis à jour avec succès ! ✅");
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

	const sectionColors = {
		profile: 'emerald',
		address: 'gray',
		home: 'blue',
		animals: 'orange',
		capacity: 'indigo',
		availability: 'emerald',
		homeDescription: 'blue',
		outsideDescription: 'green',
		stopActivity: 'red',
		additionalInformation: 'gray'
	} as const satisfies Record<keyof typeof HOST_SECTION_CONFIG, string>;
</script>

<form method="POST" action="?/updateHost" use:enhance={handleUpdateEnhance} class="space-y-6">
	<!-- 🔑 HIDDEN INPUTS -->
	<input type="hidden" name="hostId" value={hostId} />

	<div class="flex justify-end">
		<Button variant="ghost" size="icon" onclick={handleCancelClick}>
			<X class="h-5 w-5" />
		</Button>
	</div>

	<!-- 📋 SECTION 1: Statuts et Infos Personnelles -->
	<SectionCard
		icon={HOST_SECTION_CONFIG.profile.icon}
		title={HOST_SECTION_CONFIG.profile.label}
		color={sectionColors.profile}
	>
		<section class="grid grid-cols-4 gap-4">
			<div class="grid gap-2">
				<SelectField
					id="actif"
					name="actif"
					label="Statut activité"
					bind:value={editData.actif}
					options={HOST_ACTIF_OPTIONS}
					size="sm"
					required
				/>

				<SelectField
					id="type"
					name="type"
					label="Type d'accueil"
					bind:value={editData.type}
					options={HOST_TYPE_OPTIONS}
					size="sm"
					required
				/>
			</div>

			<div class="col-span-2 grid grid-cols-2 gap-4">
				<InputField
					id="firstName"
					name="firstName"
					label="Prénom"
					bind:value={editData.firstName}
					placeholder="Jean"
					error={formErrors.firstName}
					required
					size="sm"
				/>

				<InputField
					id="lastName"
					name="lastName"
					label="Nom"
					bind:value={editData.lastName}
					placeholder="Dupont"
					error={formErrors.lastName}
					required
					size="sm"
				/>

				<div class="flex items-end">
					<div class="w-full space-y-2">
						<label for="isAvailable" class="text-xs font-medium text-gray-700">Disponibilité</label>
						<div class="flex items-center gap-2">
							<Switch
								id="isAvailable"
								checked={editData.isAvailable ?? false}
								onCheckedChange={(value) => (editData.isAvailable = value)}
							/>
							<input
								type="hidden"
								name="isAvailable"
								value={editData.isAvailable ? 'true' : 'false'}
							/>
							<span class="text-xs text-gray-600">
								{editData.isAvailable ? '✓ Disponible' : '✗ Indisponible'}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div class="grid gap-2">
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
			</div>
		</section>
	</SectionCard>

	<Separator />

	<!-- 📍 SECTION 2: Adresse, Zone d'accueil, Animaux -->
	<section class="grid grid-cols-3 gap-4">
		<!-- Adresse -->
		<SectionCard
			icon={HOST_SECTION_CONFIG.address.icon}
			title={HOST_SECTION_CONFIG.address.label}
			color={sectionColors.address}
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
					<div>
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
					</div>

					<div>
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
					</div>
				</div>

				<SelectField
					id="district"
					name="district"
					label="Quartier"
					bind:value={editData.district}
					options={districtOptions}
					size="sm"
				/>
			</div>
		</SectionCard>

		<!-- Zone d'accueil -->
		<SectionCard
			icon={HOST_SECTION_CONFIG.home.icon}
			title={HOST_SECTION_CONFIG.home.label}
			color={sectionColors.home}
		>
			<div class="space-y-4">
				<InputField
					id="space"
					name="space"
					label="Espace en m2"
					bind:value={editData.space}
					placeholder="60"
					required
					size="sm"
				/>

				<TextareaField
					id="presence"
					name="presence"
					label="Présence"
					bind:value={editData.presence}
					placeholder="Présence"
				/>

				<div class="space-y-2">
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							name="outside"
							bind:checked={editData.outside}
							value="true"
							class="h-4 w-4 rounded border-gray-300"
						/>
						<span class="text-xs font-medium text-gray-700">Exterieur</span>
					</label>
					<input type="hidden" name="outside" value={editData.outside ? 'true' : 'false'} />

					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							name="car"
							bind:checked={editData.car}
							value="true"
							class="h-4 w-4 rounded border-gray-300"
						/>
						<span class="text-xs font-medium text-gray-700">Voiture</span>
					</label>
					<input type="hidden" name="car" value={editData.car ? 'true' : 'false'} />

					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							name="isStockFeed"
							bind:checked={editData.isStockFeed}
							value="true"
							class="h-4 w-4 rounded border-gray-300"
						/>
						<span class="text-xs font-medium text-gray-700">Stock</span>
					</label>
					<input type="hidden" name="isStockFeed" value={editData.isStockFeed ? 'true' : 'false'} />
				</div>
			</div>
		</SectionCard>

		<!-- Animaux -->
		<SectionCard
			icon={HOST_SECTION_CONFIG.animals.icon}
			title={HOST_SECTION_CONFIG.animals.label}
			color={sectionColors.animals}
		>
			<div class="space-y-4">
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						name="hasAnimalsAtHome"
						bind:checked={editData.hasAnimalsAtHome}
						value="true"
						class="h-4 w-4 rounded border-gray-300"
					/>
					<span class="text-xs font-medium text-gray-700">Animaux au domicile</span>
				</label>
				<input
					type="hidden"
					name="hasAnimalsAtHome"
					value={editData.hasAnimalsAtHome ? 'true' : 'false'}
				/>

				<div class="grid grid-cols-2 gap-2">
					<label class="text-xs font-medium text-gray-700">Chats</label>
					<InputField
						id="numberOfCatsAtHome"
						name="numberOfCatsAtHome"
						bind:value={editData.numberOfCatsAtHome}
						placeholder="0"
						size="sm"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<label class="text-xs font-medium text-gray-700">Chiens</label>
					<InputField
						id="numberOfDogsAtHome"
						name="numberOfDogsAtHome"
						bind:value={editData.numberOfDogsAtHome}
						placeholder="0"
						size="sm"
					/>
				</div>

				<TextareaField
					id="otherAnimalsAtHome"
					name="otherAnimalsAtHome"
					label="Autres"
					bind:value={editData.otherAnimalsAtHome}
					placeholder="Autres animaux..."
				/>
			</div>
		</SectionCard>
	</section>

	<Separator />

	<!-- 💪 SECTION 3: Capacités et Disponibilité -->
	<section class="grid grid-cols-3 gap-4">
		<div class="col-span-2">
			<SectionCard
				icon={HOST_SECTION_CONFIG.capacity.icon}
				title={HOST_SECTION_CONFIG.capacity.label}
				color={sectionColors.capacity}
			>
				<div class="grid grid-cols-3 gap-4">
					<SelectField
						id="heal"
						name="heal"
						label="Soins médicaux"
						bind:value={editData.heal}
						options={HOST_HEAL_OPTIONS}
						size="sm"
					/>

					<SelectField
						id="socialize"
						name="socialize"
						label="Socialisation"
						bind:value={editData.socialize}
						options={HOST_SOCIALIZE_OPTIONS}
						size="sm"
					/>

					<SelectField
						id="babyFeeding"
						name="babyFeeding"
						label="Biberonnage"
						bind:value={editData.babyFeeding}
						options={HOST_BABY_FEEDING_OPTIONS}
						size="sm"
					/>
				</div>
			</SectionCard>
		</div>
	</section>

	<Separator />

	<!-- 📝 SECTION 4: Descriptions -->
	<section class="space-y-4">
		<SectionCard
			icon={HOST_SECTION_CONFIG.homeDescription.icon}
			title={HOST_SECTION_CONFIG.homeDescription.label}
			color={sectionColors.homeDescription}
		>
			<TextareaField
				id="homeDescription"
				name="homeDescription"
				bind:value={editData.homeDescription}
				placeholder="Décrivez votre domicile..."
			/>
		</SectionCard>

		{#if editData.outside}
			<SectionCard
				icon={HOST_SECTION_CONFIG.outsideDescription.icon}
				title={HOST_SECTION_CONFIG.outsideDescription.label}
				color={sectionColors.outsideDescription}
			>
				<TextareaField
					id="outsideDescription"
					name="outsideDescription"
					bind:value={editData.outsideDescription}
					placeholder="Décrivez votre jardin..."
				/>
			</SectionCard>
		{/if}

		{#if editData.actif === 'STOP'}
			<SectionCard
				icon={HOST_SECTION_CONFIG.stopActivity.icon}
				title={HOST_SECTION_CONFIG.stopActivity.label}
				color={sectionColors.stopActivity}
			>
				<TextareaField
					id="stopActivity"
					name="stopActivity"
					bind:value={editData.stopActivity}
					placeholder="Raison de l'arrêt..."
				/>
			</SectionCard>

			<Separator />
		{/if}

		<SectionCard
			icon={HOST_SECTION_CONFIG.additionalInformation.icon}
			title={HOST_SECTION_CONFIG.additionalInformation.label}
			color={sectionColors.additionalInformation}
		>
			<TextareaField
				id="additionalInformation"
				name="additionalInformation"
				bind:value={editData.additionalInformation}
				placeholder="Informations additionnelles..."
			/>
		</SectionCard>
	</section>

	<Separator />

	<!-- ✅ SECTION 5: Actions (Boutons) -->
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
				actionName="?/blacklistHost"
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
				deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer cette famille d'accueil ?"
				onSuccess={handleDeleted}
			/>
		</div>

		<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
	</section>
</form>
