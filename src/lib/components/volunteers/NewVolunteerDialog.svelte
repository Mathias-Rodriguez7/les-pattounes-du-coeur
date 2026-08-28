<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import SaveCancelButtons from '../SaveCancelButtons.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { open = $bindable(false) } = $props();

	let isSubmitting = $state(false);
	let formElement: HTMLFormElement;

	const roleOptions = [
		{ value: 'ADMIN', label: 'Admin' },
		{ value: 'MANAGER', label: 'Manager' },
		{ value: 'COMMUNICATION', label: 'Communication' }
	];

	const districtOptions = Object.entries(DISTRICT_LABELS).map(([key, label]) => ({
		value: key,
		label
	}));

	let selectedRole = $state<string | undefined>();
	let selectedDistrict = $state<string | undefined>();

	function resetForm() {
		if (formElement) {
			formElement.reset();
		}
		selectedRole = undefined;
		selectedDistrict = undefined;
	}

	function handleCancel() {
		resetForm();
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Créer un nouveau Bénévole</Dialog.Title>
			<Dialog.Description>Complétez les informations du bénévole</Dialog.Description>
		</Dialog.Header>

		<form
			bind:this={formElement}
			method="POST"
			action="?/createVolunteer"
			use:enhance={({ formData }) => {
				isSubmitting = true;

				// ✅ Ajoute les valeurs sélectionnées
				if (selectedRole) {
					formData.set('role', selectedRole);
				}
				if (selectedDistrict) {
					formData.set('district', selectedDistrict);
				}

				return async ({ result }) => {
					isSubmitting = false;

					if (result.type === 'success') {
						// ✅ Invalide TOUS les données cachées
						await invalidateAll();
						resetForm();
						open = false;
					} else if (result.type === 'failure') {
						console.error('Erreur:', result.data?.error);
					}
				};
			}}
			class="space-y-4"
		>
			<div class="grid grid-cols-2 gap-6">
				<!-- Prénom -->
				<div class="grid gap-3">
					<Label for="firstName">Prénom</Label>
					<Input
						id="firstName"
						name="firstName"
						type="text"
						required
						disabled={isSubmitting}
						placeholder="Jean"
					/>
				</div>

				<!-- Nom -->
				<div class="grid gap-3">
					<Label for="lastName">Nom</Label>
					<Input
						id="lastName"
						name="lastName"
						type="text"
						required
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
					name="email"
					type="email"
					required
					disabled={isSubmitting}
					placeholder="jean@example.com"
				/>
			</div>

			<!-- Téléphone -->
			<div class="grid gap-3">
				<Label for="phone">Téléphone</Label>
				<Input
					id="phone"
					name="phone"
					type="tel"
					required
					disabled={isSubmitting}
					placeholder="06 12 34 56 78"
				/>
			</div>

			<!-- Adresse -->
			<div class="grid gap-3">
				<Label for="address">Adresse</Label>
				<Input
					id="address"
					name="address"
					type="text"
					required
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
						name="city"
						type="text"
						required
						disabled={isSubmitting}
						placeholder="Montpellier"
					/>
				</div>

				<!-- Code Postal -->
				<div class="grid gap-3">
					<Label for="postalCode">Code Postal</Label>
					<Input
						id="postalCode"
						name="postalCode"
						type="text"
						required
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
