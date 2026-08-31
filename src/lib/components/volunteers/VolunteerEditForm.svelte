<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import SaveCancelButtons from '../SaveCancelButtons.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		updateVolunteerAction,
		deleteVolunteerAction,
		blacklistVolunteerAction
	} from '$lib/utils/volunteerActions';
	import Icon from '$lib/components/Icon.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		editData: {
			firstName: string;
			lastName: string;
			email: string;
			phone: string;
			district: string;
			address: string;
			city: string;
			postalCode: string;
			actif: string;
			role: string;
		};
		volunteerId?: string;
		onSuccess?: () => void;
		onCancel?: () => void;
		isSaving?: boolean;
		isDeleting?: boolean;
	}

	let {
		editData = $bindable(),
		volunteerId,
		onSuccess,
		onCancel,
		isSaving = false,
		isDeleting = false
	}: Props = $props();

	let isBlacklisting = $state(false);
	let showBlacklistDialog = $state(false);
	let blacklistReason = $state('');

	let selectedRole = $derived(editData.role);
	let selectedStatus = $derived(editData.actif);
	let selectedDistrict = $derived(editData.district);

	const statusOptions = [
		{ value: 'ACTIVE', label: 'En activité' },
		{ value: 'BREAK', label: 'En pause' },
		{ value: 'STOP', label: 'Arrêté' }
	];

	const roleOptions = [
		{ value: 'ADMIN', label: 'Admin' },
		{ value: 'MANAGER', label: 'Manager' },
		{ value: 'COMMUNICATION', label: 'Communication' }
	];

	const handleRoleChange = (value: string) => {
		editData.role = value;
	};

	const handleStatusChange = (value: string) => {
		editData.actif = value;
	};

	const handleDistrictChange = (value: string) => {
		editData.district = value;
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		if (!volunteerId) {
			console.error('❌ volunteerId manquant');
			toast.error('Erreur: ID bénévole manquant');
			return;
		}

		isSaving = true;

		await updateVolunteerAction({
			volunteerId,
			data: editData,
			onLocalUpdate: (updatedVolunteer) => {
				console.log('✅ Local update:', updatedVolunteer);
				if (onSuccess) {
					onSuccess();
				}
			}
		});

		isSaving = false;
	};

	const handleCancelClick = () => {
		console.log('❌ Édition annulée');
		if (onCancel) {
			onCancel();
		}
	};

	const handleConfirmDelete = async () => {
		if (!volunteerId) {
			console.error('❌ volunteerId manquant');
			toast.error('Erreur: ID bénévole manquant');
			return;
		}

		isDeleting = true;

		await deleteVolunteerAction(volunteerId, () => {
			console.log('✅ Local delete');
			if (onSuccess) {
				onSuccess();
			}
		});

		isDeleting = false;
	};

	const handleBlacklistClick = () => {
		showBlacklistDialog = true;
		blacklistReason = '';
	};

	const handleConfirmBlacklist = async () => {
		if (!volunteerId) {
			console.error('❌ volunteerId manquant');
			toast.error('Erreur: ID bénévole manquant');
			return;
		}

		if (!blacklistReason.trim()) {
			toast.error('Veuillez entrer une raison');
			return;
		}

		isBlacklisting = true;

		const success = await blacklistVolunteerAction(volunteerId, editData.email, blacklistReason);

		if (success) {
			showBlacklistDialog = false;
			blacklistReason = '';
			if (onSuccess) {
				onSuccess();
			}
		}

		isBlacklisting = false;
	};

	const handleCancelBlacklist = () => {
		showBlacklistDialog = false;
		blacklistReason = '';
	};
</script>

<!-- ✅ FORMULAIRE -->
<form onsubmit={handleSubmit} class="space-y-6">
	<!-- SECTION 1: CONTACT -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Contact</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-2">
				<label for="firstname-input" class="text-sm font-medium text-gray-700">Prénom</label>
				<Input
					id="firstname-input"
					name="firstName"
					bind:value={editData.firstName}
					placeholder="Jean"
					disabled={isSaving || isDeleting || isBlacklisting}
				/>
			</div>

			<div class="space-y-2">
				<label for="lastname-input" class="text-sm font-medium text-gray-700">Nom</label>
				<Input
					id="lastname-input"
					name="lastName"
					bind:value={editData.lastName}
					placeholder="Dupont"
					disabled={isSaving || isDeleting || isBlacklisting}
				/>
			</div>

			<div class="space-y-2">
				<label for="email-input" class="text-sm font-medium text-gray-700">Email</label>
				<Input
					id="email-input"
					name="email"
					type="email"
					bind:value={editData.email}
					placeholder="jean@example.com"
					disabled={isSaving || isDeleting || isBlacklisting}
				/>
			</div>

			<div class="space-y-2">
				<label for="phone-input" class="text-sm font-medium text-gray-700">Téléphone</label>
				<Input
					id="phone-input"
					name="phone"
					type="tel"
					bind:value={editData.phone}
					placeholder="06 12 34 56 78"
					disabled={isSaving || isDeleting || isBlacklisting}
				/>
			</div>
		</div>
	</div>

	<Separator />

	<!-- SECTION 2: STATUT ET RÔLE + BLACKLIST -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Statut et Rôle</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="space-y-2">
				<label for="status-select" class="text-sm font-medium text-gray-700">Statut</label>
				<Select.Root
					type="single"
					value={selectedStatus}
					onValueChange={handleStatusChange}
					disabled={isSaving || isDeleting || isBlacklisting}
				>
					<Select.Trigger id="status-select">
						{statusOptions.find((opt) => opt.value === selectedStatus)?.label || 'Sélectionner'}
					</Select.Trigger>
					<Select.Content>
						{#each statusOptions as option (option.value)}
							<Select.Item value={option.value} label={option.label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<label for="role-select" class="text-sm font-medium text-gray-700">Rôle</label>
				<Select.Root
					type="single"
					value={selectedRole}
					onValueChange={handleRoleChange}
					disabled={isSaving || isDeleting || isBlacklisting}
				>
					<Select.Trigger id="role-select">
						{roleOptions.find((opt) => opt.value === selectedRole)?.label || 'Sélectionner'}
					</Select.Trigger>
					<Select.Content>
						{#each roleOptions as option (option.value)}
							<Select.Item value={option.value} label={option.label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- ✅ BOUTON BLACKLIST DANS LA SECTION 2 -->
			<div>
				<h3 class="text-sm font-medium text-gray-700">Actions</h3>
				<Button
					type="button"
					variant="destructive"
					disabled={isSaving || isDeleting || isBlacklisting}
					onclick={handleBlacklistClick}
					class="w-full"
				>
					<Icon name="blacklist" class="mr-2 h-4 w-4" />
					{#if isBlacklisting}
						Mise en liste noire...
					{:else}
						Ajouter à la liste noire
					{/if}
				</Button>
			</div>
		</div>
	</div>

	<Separator />

	<!-- SECTION 3: LOCALISATION -->
	<div>
		<h3 class="mb-4 text-sm font-semibold text-gray-900">Localisation</h3>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-2">
				<label for="address-input" class="text-sm font-medium text-gray-700">Adresse</label>
				<Input
					id="address-input"
					name="address"
					bind:value={editData.address}
					placeholder="123 rue de la Paix"
					disabled={isSaving || isDeleting || isBlacklisting}
				/>
			</div>

			<div class="space-y-2">
				<label for="city-input" class="text-sm font-medium text-gray-700">Ville</label>
				<Input
					id="city-input"
					name="city"
					bind:value={editData.city}
					placeholder="Paris"
					disabled={isSaving || isDeleting || isBlacklisting}
				/>
			</div>

			<div class="space-y-2">
				<label for="postalcode-input" class="text-sm font-medium text-gray-700">Code postal</label>
				<Input
					id="postalcode-input"
					name="postalCode"
					bind:value={editData.postalCode}
					placeholder="75001"
					disabled={isSaving || isDeleting || isBlacklisting}
				/>
			</div>

			<div class="space-y-2">
				<label for="district-select" class="text-sm font-medium text-gray-700">Quartier</label>
				<Select.Root
					type="single"
					value={selectedDistrict}
					onValueChange={handleDistrictChange}
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

	<Separator />

	<!-- ✅ BOUTONS -->
	<SaveCancelButtons
		onCancel={handleCancelClick}
		onDelete={handleConfirmDelete}
		{isSaving}
		{isDeleting}
		showDelete={true}
		deleteConfirmMessage="Êtes-vous sûr de vouloir supprimer ce bénévole ?"
		class="pt-4"
	/>
</form>

<!-- ✅ DIALOG BLACKLIST -->
<Dialog.Root bind:open={showBlacklistDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>🚫 Blacklister</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<p class="text-sm text-gray-600">
				Vous êtes sur le point de blacklister <strong
					>{editData.firstName} {editData.lastName}</strong
				>.
			</p>

			<div class="space-y-2">
				<label for="reason-input" class="text-sm font-medium text-gray-700">Raison</label>
				<textarea
					id="reason-input"
					bind:value={blacklistReason}
					placeholder="Entrez la raison de la mise en liste noire..."
					class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					rows="4"
					disabled={isBlacklisting}
				></textarea>
			</div>
		</div>

		<Dialog.Footer>
			<Button
				type="button"
				variant="outline"
				disabled={isBlacklisting}
				onclick={handleCancelBlacklist}
			>
				Annuler
			</Button>
			<Button
				type="button"
				variant="destructive"
				disabled={isBlacklisting || !blacklistReason.trim()}
				onclick={handleConfirmBlacklist}
			>
				{#if isBlacklisting}
					Mise en liste noire...
				{:else}
					Confirmer la mise en liste noire
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
