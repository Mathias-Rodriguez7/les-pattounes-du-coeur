<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import Icon from '$lib/components/Icon.svelte';
	import { toast } from 'svelte-sonner';
	import { X } from '@lucide/svelte';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import DeleteButton from '../buttons/DeleteButton.svelte';
	import BlacklistButton from '../buttons/BlacklistButton.svelte';

	let {
		editData = $bindable(),
		hostId,
		onSuccess,
		onCancel,
		isSaving = false,
		isDeleting = false
	} = $props();

	let formErrors = $state({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		postalCode: ''
	});

	let isBlacklisting = $state(false);
	let selectedDistrict = $state('');

	function handleSelectDistrict(value: string) {
		selectedDistrict = value;
		editData.district = value;
	}

	const ACTIF_OPTIONS = [
		{ value: 'ACTIVE', label: 'En activité' },
		{ value: 'BREAK', label: 'En pause' },
		{ value: 'STOP', label: 'Arrêté' }
	];

	const TYPE_OPTIONS = [
		{ value: 'CLASSIC', label: 'Accueil Long' },
		{ value: 'RELAY', label: 'Relais' }
	];

	const SPACE_OPTIONS = [
		{ value: 'SMALL', label: 'Petit' },
		{ value: 'MEDIUM', label: 'Moyen' },
		{ value: 'LARGE', label: 'Grand' }
	];

	const HEAL_OPTIONS = [
		{ value: 'NONE', label: 'Aucun' },
		{ value: 'LIGHT', label: 'Légé' },
		{ value: 'HEAVY', label: 'Lourd' },
		{ value: 'HEAVY_STING', label: 'Lourd avec seringue' }
	];

	const SOCIALIZE_OPTIONS = [
		{ value: 'NO', label: 'Non' },
		{ value: 'FEARFUL', label: 'Craintive' },
		{ value: 'WITHOUT_EX', label: 'Sans xp' },
		{ value: 'EXPERIENCED', label: 'Expérimenté' }
	];

	const BABY_FEEDING_OPTIONS = [
		{ value: 'NO', label: 'Non' },
		{ value: 'WITHOUT_EX', label: 'Sans xp' },
		{ value: 'EXPERIENCED', label: 'Expérimenté' },
		{ value: 'RELAY', label: 'Relai' }
	];

	const STATUS_OPTIONS = [
		{ value: 'FREE', label: 'Libre' },
		{ value: 'CAT_PLACE', label: 'Chat placé' },
		{ value: 'WAITING', label: 'En attente' },
		{ value: 'WAITING_VALIDATION', label: 'Attente de validation' }
	];

	const SECTION_CONFIG = {
		address: { icon: 'map', label: 'Adresse' },
		home: { icon: 'house', label: "Zone d'accueil" },
		animals: { icon: 'paw', label: 'Animaux' },
		capacity: { icon: 'heart', label: 'Capacités' },
		availability: { icon: 'Handshake', label: 'Colaboration' },
		homeDescription: { icon: 'house', label: 'Description du domicile' },
		outsideDescription: { icon: 'trees', label: 'Description du jardin' },
		stopActivity: { icon: 'CircleX', label: "Raison d'arrêt" },
		additionalInformation: { icon: 'plus', label: 'Infos additionnelles' }
	};

	const handleUpdateEnhance: SubmitFunction = ({ formData }) => {
		isSaving = true;

		// Ajouter l'ID du bénévole
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

	// Derived states for select display
	const actifLabel = $derived(
		ACTIF_OPTIONS.find((o) => o.value === editData.actif)?.label ?? 'Sélectionner...'
	);
	const typeLabel = $derived(
		TYPE_OPTIONS.find((o) => o.value === editData.type)?.label ?? 'Sélectionner...'
	);
	const spaceLabel = $derived(
		SPACE_OPTIONS.find((o) => o.value === editData.space)?.label ?? 'Sélectionner...'
	);
	const healLabel = $derived(
		HEAL_OPTIONS.find((o) => o.value === editData.heal)?.label ?? 'Sélectionner...'
	);
	const socializeLabel = $derived(
		SOCIALIZE_OPTIONS.find((o) => o.value === editData.socialize)?.label ?? 'Sélectionner...'
	);
	const babyFeedingLabel = $derived(
		BABY_FEEDING_OPTIONS.find((o) => o.value === editData.babyFeeding)?.label ?? 'Sélectionner...'
	);
	const statusLabel = $derived(
		STATUS_OPTIONS.find((o) => o.value === editData.status)?.label ?? 'Sélectionner...'
	);
</script>

<form method="POST" action="?/updateHost" use:enhance={handleUpdateEnhance} class="space-y-6">
	<section class="grid grid-cols-5 gap-4">
		<!-- Col : Statuts -->
		<div class="col-span-1 grid grid-cols-1 gap-4">
			<div>
				<label for="actif" class="text-xs font-medium text-gray-700">Statut activité</label>
				<Select.Root type="single" bind:value={editData.actif}>
					<Select.Trigger>
						{actifLabel}
					</Select.Trigger>
					<Select.Content>
						{#each ACTIF_OPTIONS as option (option.value)}
							<Select.Item value={option.value} label={option.label}>
								{option.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div>
				<label for="type" class="text-xs font-medium text-gray-700">Type d'accueil</label>
				<Select.Root type="single" bind:value={editData.type}>
					<Select.Trigger>
						{typeLabel}
					</Select.Trigger>
					<Select.Content>
						{#each TYPE_OPTIONS as option (option.value)}
							<Select.Item value={option.value} label={option.label}>
								{option.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Grille : Infos personnelles -->
		<div class="col-span-2 grid grid-cols-2 gap-4">
			<div>
				<label for="firstName" class="text-xs font-medium text-gray-700">Prénom *</label>
				<Input
					bind:value={editData.firstName}
					placeholder="Prénom"
					class={formErrors.firstName ? 'border-red-500' : ''}
				/>
				{#if formErrors.firstName}
					<p class="mt-1 text-xs text-red-500">{formErrors.firstName}</p>
				{/if}
			</div>

			<div>
				<label for="lastName" class="text-xs font-medium text-gray-700">Nom *</label>
				<Input
					bind:value={editData.lastName}
					placeholder="Nom"
					class={formErrors.lastName ? 'border-red-500' : ''}
				/>
				{#if formErrors.lastName}
					<p class="mt-1 text-xs text-red-500">{formErrors.lastName}</p>
				{/if}
			</div>

			<div>
				<label for="isAvailable" class="text-xs font-medium text-gray-700">Disponibilité</label>
				<div class="flex items-center justify-start pt-2">
					<Switch
						id="isAvailable"
						checked={editData.isAvailable ?? false}
						onCheckedChange={(value) => (editData.isAvailable = value)}
					/>
				</div>
			</div>

			<div>
				<label for="status" class="text-xs font-medium text-gray-700">Etat</label>
				<Select.Root type="single" bind:value={editData.status}>
					<Select.Trigger>
						{statusLabel}
					</Select.Trigger>
					<Select.Content>
						{#each STATUS_OPTIONS as option (option.value)}
							<Select.Item value={option.value} label={option.label}>
								{option.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Col : Contact -->
		<div class="col-span-2 grid grid-cols-1 gap-4">
			<div class="flex justify-end">
				<Button variant="ghost" size="icon" onclick={handleCancel}>
					<X class="h-5 w-5" />
				</Button>
			</div>
			<div class="flex items-end gap-4">
				<div>
					<label for="email" class="text-xs font-medium text-gray-700">Email *</label>
					<Input
						bind:value={editData.email}
						type="email"
						placeholder="email@example.com"
						class={formErrors.email ? 'border-red-500' : ''}
					/>
					{#if formErrors.email}
						<p class="mt-1 text-xs text-red-500">{formErrors.email}</p>
					{/if}
				</div>

				<div class="w-28">
					<label for="phone" class="text-xs font-medium text-gray-700">Téléphone *</label>
					<Input
						bind:value={editData.phone}
						placeholder="06 12 34 56 78"
						class={formErrors.phone ? 'border-red-500' : ''}
					/>
					{#if formErrors.phone}
						<p class="mt-1 text-xs text-red-500">{formErrors.phone}</p>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<Separator />
	<section class="grid grid-cols-3 gap-4">
		<!-- Col : Adresse -->
		<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
			<div class="mb-4 flex items-center gap-2">
				<Icon name={SECTION_CONFIG.address.icon} class="h-5 w-5 text-slate-700" />
				<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.address.label}</h4>
			</div>

			<div class="grid grid-cols-1 gap-4">
				<div>
					<label for="address" class="text-xs font-medium text-gray-700">Rue *</label>
					<Input
						bind:value={editData.address}
						placeholder="Adresse"
						class={formErrors.address ? 'border-red-500' : ''}
					/>
					{#if formErrors.address}
						<p class="mt-1 text-xs text-red-500">{formErrors.address}</p>
					{/if}
				</div>

				<div class="flex gap-4">
					<div>
						<label for="city" class="text-xs font-medium text-gray-700">Ville *</label>
						<Input
							bind:value={editData.city}
							placeholder="Ville"
							class={formErrors.city ? 'border-red-500' : ''}
						/>
						{#if formErrors.city}
							<p class="mt-1 text-xs text-red-500">{formErrors.city}</p>
						{/if}
					</div>

					<div>
						<label for="postalCode" class="text-xs font-medium text-gray-700">Code postal *</label>
						<Input
							bind:value={editData.postalCode}
							placeholder="75000"
							class={formErrors.postalCode ? 'border-red-500' : ''}
						/>
						{#if formErrors.postalCode}
							<p class="mt-1 text-xs text-red-500">{formErrors.postalCode}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<label for="district-select" class="text-sm font-medium text-gray-700">Quartier</label>
					<Select.Root
						type="single"
						value={selectedDistrict}
						onValueChange={handleSelectDistrict}
						disabled={isSaving || isDeleting || isBlacklisting}
					>
						<Select.Trigger id="district-select">
							{Object.entries(DISTRICT_LABELS).find(([k]) => k === selectedDistrict)?.[1] ||
								'Sélectionner'}
						</Select.Trigger>
						<Select.Content>
							{#each Object.entries(DISTRICT_LABELS) as [key, label] (key)}
								<Select.Item value={key} {label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<!-- Col : Zone d'accueil -->
		<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
			<div class="mb-4 flex items-center gap-2">
				<Icon name={SECTION_CONFIG.home.icon} class="h-5 w-5 text-blue-700" />
				<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.home.label}</h4>
			</div>

			<div class="space-y-4">
				<div class="grid grid-cols-1 gap-4">
					<div>
						<label for="space" class="text-xs font-medium text-gray-700">Espace</label>
						<Select.Root type="single" bind:value={editData.space}>
							<Select.Trigger>
								{spaceLabel}
							</Select.Trigger>
							<Select.Content>
								{#each SPACE_OPTIONS as option (option.value)}
									<Select.Item value={option.value} label={option.label}>
										{option.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div>
						<label for="presence" class="text-xs font-medium text-gray-700">Présence</label>
						<Input bind:value={editData.presence} placeholder="75000" />
					</div>

					<div class="flex items-end">
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={editData.outside}
								class="h-4 w-4 rounded border-gray-300"
							/>
							<span class="text-xs font-medium text-gray-700">Jardin</span>
						</label>
					</div>

					<div class="flex items-end">
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={editData.car}
								class="h-4 w-4 rounded border-gray-300"
							/>
							<span class="text-xs font-medium text-gray-700">Voiture</span>
						</label>
					</div>

					<div class="flex items-end">
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={editData.isStockFeed}
								class="h-4 w-4 rounded border-gray-300"
							/>
							<span class="text-xs font-medium text-gray-700">Stock</span>
						</label>
					</div>
				</div>
			</div>
		</div>

		<!-- Col : Animaux -->
		<div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
			<div class="mb-3 flex items-center gap-2">
				<Icon name={SECTION_CONFIG.animals.icon} class="h-5 w-5 text-orange-700" />
				<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.animals.label}</h4>
			</div>

			<div class="space-y-4">
				<div class="grid grid-cols-1 gap-4">
					<div class="flex items-end">
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={editData.hasAnimalsAtHome}
								class="h-4 w-4 rounded border-gray-300"
							/>
							<span class="text-xs font-medium text-gray-700">Animaux dans le domicile</span>
						</label>
					</div>

					<div class="grid grid-cols-2 items-center">
						<label for="numberOfCatsAtHome" class="text-xs font-medium text-gray-700">Chats</label>
						<Input bind:value={editData.numberOfCatsAtHome} placeholder="3" />
					</div>

					<div class="grid grid-cols-2 items-center">
						<label for="numberOfDogsAtHome" class="text-xs font-medium text-gray-700">Chiens</label>
						<Input bind:value={editData.numberOfDogsAtHome} placeholder="3" />
					</div>

					<div class="grid grid-cols-1 items-center gap-2">
						<label for="otherAnimalsAtHome" class="text-xs font-medium text-gray-700">Autres</label>
						<Textarea bind:value={editData.otherAnimalsAtHome} placeholder="Autres" />
					</div>
				</div>
			</div>
		</div>
	</section>
	<Separator />

	<!-- Grille : Capacités -->
	<section class="grid grid-cols-3 gap-4">
		<div class="col-span-2 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
			<div class="mb-4 flex items-center gap-2">
				<Icon name={SECTION_CONFIG.capacity.icon} class="h-5 w-5 text-indigo-700" />
				<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.capacity.label}</h4>
			</div>

			<div class="ml-6 grid grid-cols-3 gap-4">
				<div>
					<label for="heal" class="text-xs font-medium text-gray-700">Soins médicaux</label>
					<Select.Root type="single" bind:value={editData.heal}>
						<Select.Trigger>
							{healLabel}
						</Select.Trigger>
						<Select.Content>
							{#each HEAL_OPTIONS as option (option.value)}
								<Select.Item value={option.value} label={option.label}>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<label for="socialize" class="text-xs font-medium text-gray-700">Socialisation</label>
					<Select.Root type="single" bind:value={editData.socialize}>
						<Select.Trigger>
							{socializeLabel}
						</Select.Trigger>
						<Select.Content>
							{#each SOCIALIZE_OPTIONS as option (option.value)}
								<Select.Item value={option.value} label={option.label}>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<label for="babyFeeding" class="text-xs font-medium text-gray-700">Nourrissage</label>
					<Select.Root type="single" bind:value={editData.babyFeeding}>
						<Select.Trigger>
							{babyFeedingLabel}
						</Select.Trigger>
						<Select.Content>
							{#each BABY_FEEDING_OPTIONS as option (option.value)}
								<Select.Item value={option.value} label={option.label}>
									{option.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<div class="col-span-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
			<div class="mb-3 flex items-center gap-2">
				<Icon name={SECTION_CONFIG.availability.icon} class="h-5 w-5 text-emerald-700" />
				<h4 class="text-sm font-semibold text-gray-900">
					{SECTION_CONFIG.availability.label}
				</h4>
			</div>
			<div>
				<label for="availabilityDuration" class="text-xs font-medium text-gray-700"
					>Durée de collaboration</label
				>
				<Input bind:value={editData.availabilityDuration} placeholder="75000" />
			</div>
		</div>
	</section>
	<Separator />

	<section class="grid grid-cols-1 gap-4">
		<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
			<div class="mb-3 flex items-center gap-2">
				<Icon name={SECTION_CONFIG.homeDescription.icon} class="h-5 w-5 text-blue-700" />
				<h4 class="text-sm font-semibold text-gray-900">
					{SECTION_CONFIG.homeDescription.label}
				</h4>
			</div>
			<div class="ml-6">
				<Textarea bind:value={editData.homeDescription} placeholder="Décrivez votre domicile..." />
			</div>
		</div>

		{#if editData.outside}
			<div class="rounded-lg border border-green-200 bg-green-50 p-4">
				<div class="mb-3 flex items-center gap-2">
					<Icon name={SECTION_CONFIG.outsideDescription.icon} class="h-5 w-5 text-emerald-700" />
					<h4 class="text-sm font-semibold text-gray-900">
						{SECTION_CONFIG.outsideDescription.label}
					</h4>
				</div>
				<div class="ml-6">
					<Textarea
						bind:value={editData.outsideDescription}
						placeholder="Décrivez votre jardin..."
					/>
				</div>
			</div>
		{/if}

		<!-- Infos additionnelles -->
		{#if editData.actif === 'STOP'}
			<div class="rounded-lg border border-red-200 bg-red-50 p-4">
				<div class="mb-4 flex items-center gap-2">
					<Icon name={SECTION_CONFIG.stopActivity.icon} class="h-5 w-5 text-red-700" />
					<h4 class="text-sm font-semibold text-gray-900">{SECTION_CONFIG.stopActivity.label}</h4>
				</div>

				<div class="ml-6">
					<Textarea
						bind:value={editData.stopActivity}
						placeholder="Expliquez la raison de l'arrêt..."
					/>
				</div>
			</div>

			<Separator />
		{/if}

		<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
			<div class="mb-4 flex items-center gap-2">
				<Icon name={SECTION_CONFIG.additionalInformation.icon} class="h-5 w-5 text-slate-700" />
				<h4 class="text-sm font-semibold text-gray-900">
					{SECTION_CONFIG.additionalInformation.label}
				</h4>
			</div>

			<div class="ml-6">
				<Textarea
					bind:value={editData.additionalInformation}
					placeholder="Informations additionnelles..."
				/>
			</div>
		</div>
	</section>
	<Separator />

	<!-- ✅ BOUTONS UPDATE + DELETE -->
	<section class="flex justify-between">
		<div class="flex gap-4">
			<!-- ✅ BLACKLIST BUTTON -->
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

			<!-- ✅ DeleteButton -->
			<DeleteButton
				{profileId}
				firstName={editData.firstName}
				lastName={editData.lastName}
				{isDeleting}
				{isSaving}
				showDelete={true}
				deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce bénévole ?"
				actionName="?/deleteVolunteer"
				onSuccess={handleDeleted}
			/>
		</div>
		<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
	</section>
</form>
