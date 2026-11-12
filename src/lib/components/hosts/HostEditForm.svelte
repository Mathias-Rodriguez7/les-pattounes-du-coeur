<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { DISTRICT_LABELS } from '#lib/utils/districts.ts';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import SwitchField from '../fields/SwitchField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import CheckboxField from '../fields/CheckboxField.svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import BlacklistAddDialog from '#lib/components/blacklist/BlacklistAddDialog.svelte';
	import {
		HOST_ACTIF_OPTIONS,
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS,
		HOST_SECTION_CONFIG
	} from '#lib/constants/host.ts';
	import type { HostEditData } from '#lib/types/host.ts';
	import SectionCard from '../cards/SectionCard.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import DateRangePicker from '../fields/DateRangePicker.svelte';

	let {
		editData = $bindable<HostEditData>(),
		hostId = '',
		profileId = '',
		onSuccess,
		onCancel
	} = $props();

	let isSaving = $state(false);
	let isDeleting = $state(false);

	// Erreurs renvoyées par le serveur (format Zod : { champ: ['message'] })
	let serverErrors = $state<Record<string, string[] | undefined>>({});

	function fieldError(field: string): string {
		return serverErrors[field]?.[0] ?? '';
	}

	const handleUpdateEnhance: SubmitFunction = () => {
		isSaving = true;
		serverErrors = {};

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success("Famille d'accueil mise à jour avec succès");
				await update();
				onSuccess?.();
			} else if (result.type === 'failure') {
				serverErrors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) || 'Erreur lors de la mise à jour');
				await update({ reset: false });
			}
			isSaving = false;
		};
	};

	const handleCancelClick = () => onCancel?.();

	const handleDeleted = () => {
		isDeleting = false;
		onSuccess?.();
	};

	const handleBlacklisted = () => onSuccess?.();

	const handleBreakDateRangeSelect = (dates: { start: Date; end: Date }) => {
		editData.breakStartDate = dates.start;
		editData.breakEndDate = dates.end;
	};

	const districtOptions = Object.entries(DISTRICT_LABELS).map(([value, label]) => ({
		value,
		label
	}));
	const showBreakDateRange = $derived(editData.actif === 'BREAK');
</script>

<form method="POST" action="?/updateHost" use:enhance={handleUpdateEnhance} class="space-y-6">
	<input type="hidden" name="hostId" value={hostId} />

	<div class="flex items-center justify-between gap-2">
		<h2 class="min-w-0 truncate text-lg font-semibold">
			Éditer la FA : {editData.firstName || 'Sans nom'}
			{editData.lastName || 'Sans nom'}
		</h2>

		<Button
			variant="ghost"
			size="icon"
			class="shrink-0"
			onclick={handleCancelClick}
			aria-label="Annuler la modification"
		>
			<X class="h-5 w-5" />
		</Button>
	</div>

	<!-- SECTION 1 : Statuts + Profil -->
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<SectionCard
			icon={HOST_SECTION_CONFIG.statuts.icon}
			title={HOST_SECTION_CONFIG.statuts.label}
			color={HOST_SECTION_CONFIG.statuts.color}
		>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

				{#if showBreakDateRange}
					<div class="sm:col-span-2">
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

				<SwitchField
					id="isAvailable"
					name="isAvailable"
					label="Disponibilité"
					checked={editData.isAvailable ?? false}
					checkedLabel="✓ Disponible"
					uncheckedLabel="✗ Indisponible"
					onChange={(value) => (editData.isAvailable = value)}
				/>
			</div>
		</SectionCard>

		<SectionCard
			icon={HOST_SECTION_CONFIG.profile.icon}
			title={HOST_SECTION_CONFIG.profile.label}
			color={HOST_SECTION_CONFIG.profile.color}
		>
			<div class="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
				<InputField
					id="firstName"
					name="firstName"
					label="Prénom"
					bind:value={editData.firstName}
					placeholder="Jean"
					error={fieldError('firstName')}
					required
					size="sm"
				/>

				<InputField
					id="lastName"
					name="lastName"
					label="Nom"
					bind:value={editData.lastName}
					placeholder="Dupont"
					error={fieldError('lastName')}
					required
					size="sm"
				/>

				<DatePicker
					name="birthDate"
					value={editData.birthDate}
					onSelect={(date) => (editData.birthDate = date)}
					label="Date d'anniversaire"
					error={fieldError('birthDate')}
				/>
			</div>
		</SectionCard>
	</section>

	<Separator />

	<!-- Adresse + Contact -->
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<SectionCard
			icon={HOST_SECTION_CONFIG.address.icon}
			title={HOST_SECTION_CONFIG.address.label}
			color={HOST_SECTION_CONFIG.address.color}
		>
			<div class="space-y-4">
				<InputField
					id="address"
					name="address"
					label="Rue"
					bind:value={editData.address}
					placeholder="Adresse"
					error={fieldError('address')}
					required
					size="sm"
				/>

				<!-- PC : sur une ligne (comme avant) | Mobile : empilés -->
				<div class="grid grid-cols-1 gap-4 sm:flex">
					<InputField
						id="city"
						name="city"
						label="Ville"
						bind:value={editData.city}
						placeholder="Ville"
						error={fieldError('city')}
						required
						size="sm"
					/>

					<InputField
						id="postalCode"
						name="postalCode"
						label="Code postal"
						bind:value={editData.postalCode}
						placeholder="34000"
						error={fieldError('postalCode')}
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

		<SectionCard
			icon={HOST_SECTION_CONFIG.contact.icon}
			title={HOST_SECTION_CONFIG.contact.label}
			color={HOST_SECTION_CONFIG.contact.color}
		>
			<div class="grid gap-2">
				<InputField
					id="phone"
					name="phone"
					label="Téléphone"
					type="tel"
					bind:value={editData.phone}
					placeholder="0612345678"
					error={fieldError('phone')}
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
					error={fieldError('email')}
					required
					size="sm"
				/>
			</div>
		</SectionCard>
	</section>

	<Separator />

	<!-- SECTION 2 : PC 4 colonnes (comme avant) | Tablette 2 | Mobile 1 -->
	<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<SectionCard
			icon={HOST_SECTION_CONFIG.home.icon}
			title={HOST_SECTION_CONFIG.home.label}
			color={HOST_SECTION_CONFIG.home.color}
		>
			<div class="space-y-4">
				<InputField
					id="space"
					name="space"
					label="Espace en m²"
					type="number"
					bind:value={editData.space}
					placeholder="60"
					error={fieldError('space')}
					required
					size="sm"
				/>

				<div class="space-y-2">
					<CheckboxField
						id="outside"
						name="outside"
						label="Extérieur"
						checked={editData.outside}
						onChange={(value) => (editData.outside = value)}
					/>
					<CheckboxField
						id="car"
						name="car"
						label="Voiture"
						checked={editData.car}
						onChange={(value) => (editData.car = value)}
					/>
					<CheckboxField
						id="isStockFeed"
						name="isStockFeed"
						label="Stock"
						checked={editData.isStockFeed}
						onChange={(value) => (editData.isStockFeed = value)}
					/>
				</div>
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
					label="Animaux au domicile"
					checked={editData.hasAnimalsAtHome}
					onChange={(value) => (editData.hasAnimalsAtHome = value)}
				/>

				{#if editData.hasAnimalsAtHome}
					<InputField
						id="numberOfCatsAtHome"
						name="numberOfCatsAtHome"
						label="Chats"
						type="number"
						bind:value={editData.numberOfCatsAtHome}
						placeholder="0"
						size="sm"
					/>
					<InputField
						id="numberOfDogsAtHome"
						name="numberOfDogsAtHome"
						label="Chiens"
						type="number"
						bind:value={editData.numberOfDogsAtHome}
						placeholder="0"
						size="sm"
					/>
					<TextareaField
						id="otherAnimalsAtHome"
						name="otherAnimalsAtHome"
						label="Autres"
						bind:value={editData.otherAnimalsAtHome}
						placeholder="Autres animaux..."
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

		<SectionCard
			icon={HOST_SECTION_CONFIG.cat.icon}
			title={HOST_SECTION_CONFIG.cat.label}
			color={HOST_SECTION_CONFIG.cat.color}
		>
			<div class="grid gap-4">
				<InputField
					id="catAdult"
					name="catAdult"
					label="Chat adulte"
					type="number"
					bind:value={editData.catAdult}
					placeholder="0"
					size="sm"
				/>
				<CheckboxField
					id="kittyAndKitten"
					name="kittyAndKitten"
					label="Chatte avec portée"
					checked={editData.kittyAndKitten}
					onChange={(value) => (editData.kittyAndKitten = value)}
				/>
				<InputField
					id="kitten"
					name="kitten"
					label="Chaton"
					type="number"
					bind:value={editData.kitten}
					placeholder="0"
					size="sm"
				/>
			</div>
		</SectionCard>
	</section>

	<Separator />

	<!-- SECTION 3 : Descriptions (inchangé) -->
	<section class="space-y-4">
		<SectionCard
			icon={HOST_SECTION_CONFIG.homeDescription.icon}
			title={HOST_SECTION_CONFIG.homeDescription.label}
			color={HOST_SECTION_CONFIG.homeDescription.color}
		>
			<TextareaField
				id="homeDescription"
				name="homeDescription"
				bind:value={editData.homeDescription}
				placeholder="Décrivez votre domicile..."
			/>
		</SectionCard>

		<SectionCard
			icon={HOST_SECTION_CONFIG.presence.icon}
			title={HOST_SECTION_CONFIG.presence.label}
			color={HOST_SECTION_CONFIG.presence.color}
		>
			<TextareaField
				id="presence"
				name="presence"
				label="Présence"
				bind:value={editData.presence}
				placeholder="Présence"
			/>
		</SectionCard>

		{#if editData.outside}
			<SectionCard
				icon={HOST_SECTION_CONFIG.outsideDescription.icon}
				title={HOST_SECTION_CONFIG.outsideDescription.label}
				color={HOST_SECTION_CONFIG.outsideDescription.color}
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
				color={HOST_SECTION_CONFIG.stopActivity.color}
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
			color={HOST_SECTION_CONFIG.additionalInformation.color}
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

	<!-- SECTION 4 : Actions -->
	<!-- PC : une ligne, comme avant | Mobile : Enregistrer en haut, actions dangereuses en dessous -->
	<section class="flex flex-col-reverse gap-4 lg:flex-row lg:justify-between">
		<div class="flex flex-wrap gap-2 lg:gap-4">
			<!-- Même module que la page Liste noire : le compte est retrouvé par son email -->
			<BlacklistAddDialog
				email={editData.email}
				name={`${editData.firstName} ${editData.lastName}`}
				trigger="button"
				onSuccess={handleBlacklisted}
			/>

			<DeleteButton
				entityId={profileId}
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
