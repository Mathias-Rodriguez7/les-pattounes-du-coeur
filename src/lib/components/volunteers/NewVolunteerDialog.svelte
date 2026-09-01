<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import SaveCancelButtons from '../SaveCancelButtons.svelte';
	import { createVolunteerAction } from '$lib/utils/volunteerActions';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false) } = $props();

	let isSubmitting = $state(false);

	const roleOptions = [
		{ value: 'ADMIN', label: 'Admin' },
		{ value: 'MANAGER', label: 'Manager' },
		{ value: 'COMMUNICATION', label: 'Communication' }
	];

	const districtOptions = Object.entries(DISTRICT_LABELS).map(([key, label]) => ({
		value: key,
		label
	}));

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('');
	let postalCode = $state('');
	let selectedRole = $state<string>('MANAGER');
	let selectedDistrict = $state<string>('');

	function resetForm() {
		firstName = '';
		lastName = '';
		email = '';
		phone = '';
		address = '';
		city = '';
		postalCode = '';
		selectedRole = 'MANAGER';
		selectedDistrict = '';
	}

	function handleCancel() {
		resetForm();
		open = false;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		console.log('📋 Soumission du formulaire');
		isSubmitting = true;

		try {
			// ✅ Validation basique
			if (!firstName.trim() || !lastName.trim() || !email.trim()) {
				toast.error('Prénom, nom et email sont requis');
				isSubmitting = false;
				return;
			}

			const result = await createVolunteerAction({
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: email.trim(),
				phone: phone.trim(),
				address: address.trim(),
				city: city.trim(),
				postalCode: postalCode.trim(),
				district: selectedDistrict,
				role: selectedRole
			});

			if (result.success) {
				console.log('✅ Bénévole créé avec succès');
				resetForm();
				open = false;
			} else {
				console.error('❌ Erreur lors de la création');
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Créer un nouveau Bénévole</Dialog.Title>
			<Dialog.Description>Complétez les informations du bénévole</Dialog.Description>
		</Dialog.Header>

		<!-- ✅ onsubmit à la place de on:submit -->
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-2 gap-6">
				<!-- Prénom -->
				<div class="grid gap-3">
					<Label for="firstName">Prénom</Label>
					<Input
						id="firstName"
						bind:value={firstName}
						type="text"
						disabled={isSubmitting}
						placeholder="Jean"
					/>
				</div>

				<!-- Nom -->
				<div class="grid gap-3">
					<Label for="lastName">Nom</Label>
					<Input
						id="lastName"
						bind:value={lastName}
						type="text"
						disabled={isSubmitting}
						placeholder="Dupont"
					/>
				</div>
			</div>

			<!-- Email -->
			<div class="grid gap-3">
				<Label for="email">Email</Label>
				<Input
					id="email"
					bind:value={email}
					type="email"
					disabled={isSubmitting}
					placeholder="jean@example.com"
				/>
			</div>

			<!-- Téléphone -->
			<div class="grid gap-3">
				<Label for="phone">Téléphone</Label>
				<Input
					id="phone"
					bind:value={phone}
					type="tel"
					disabled={isSubmitting}
					placeholder="06 12 34 56 78"
				/>
			</div>

			<!-- Adresse -->
			<div class="grid gap-3">
				<Label for="address">Adresse</Label>
				<Input
					id="address"
					bind:value={address}
					type="text"
					disabled={isSubmitting}
					placeholder="123 rue de la Paix"
				/>
			</div>

			<div class="grid grid-cols-2 gap-6">
				<!-- Ville -->
				<div class="grid gap-3">
					<Label for="city">Ville</Label>
					<Input
						id="city"
						bind:value={city}
						type="text"
						disabled={isSubmitting}
						placeholder="Montpellier"
					/>
				</div>

				<!-- Code Postal -->
				<div class="grid gap-3">
					<Label for="postalCode">Code Postal</Label>
					<Input
						id="postalCode"
						bind:value={postalCode}
						type="text"
						disabled={isSubmitting}
						placeholder="34000"
					/>
				</div>
			</div>

			<!-- Quartier / District -->
			<div class="grid gap-3">
				<Label for="district">Quartier</Label>
				<Select.Root type="single" bind:value={selectedDistrict} disabled={isSubmitting}>
					<Select.Trigger id="district">
						{districtOptions.find((o) => o.value === selectedDistrict)?.label ||
							'Sélectionner un quartier'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="Aucun" />
						{#each districtOptions as option (option.value)}
							<Select.Item value={option.value} label={option.label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Rôle -->
			<div class="grid gap-3">
				<Label for="role">Rôle</Label>
				<Select.Root type="single" bind:value={selectedRole} disabled={isSubmitting}>
					<Select.Trigger id="role">
						{roleOptions.find((o) => o.value === selectedRole)?.label || 'Sélectionner un rôle'}
					</Select.Trigger>
					<Select.Content>
						{#each roleOptions as option (option.value)}
							<Select.Item value={option.value} label={option.label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- SaveCancelButtons -->
			<SaveCancelButtons onCancel={handleCancel} isSaving={isSubmitting} class="pt-4" />
		</form>
	</Dialog.Content>
</Dialog.Root>
