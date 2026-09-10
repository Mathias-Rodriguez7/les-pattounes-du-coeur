<script lang="ts">
	import { createVolunteerSchema } from '$lib/schemas/volunteer';
	import { flattenErrors, getFieldError } from '$lib/utils/zodErrors';
	import type { FlattenedErrors } from '$lib/utils/zodErrors';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { open = $bindable(false) } = $props();
	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('');
	let postalCode = $state('');
	let selectedDistrict = $state<string>('');
	let selectedRole = $state<string>('MANAGER');

	const roleOptions = [
		{ value: 'ADMIN', label: 'Admin' },
		{ value: 'MANAGER', label: 'Manager' },
		{ value: 'COMMUNICATION', label: 'Communication' }
	];

	const districtOptions = Object.entries(DISTRICT_LABELS).map(([key, label]) => ({
		value: key,
		label
	}));

	// ✅ VALIDATION CÔTÉ CLIENT
	function validateForm(): boolean {
		const result = createVolunteerSchema.safeParse({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict.trim() !== '' ? selectedDistrict : undefined,
			role: selectedRole
		});

		if (!result.success) {
			fieldErrors = flattenErrors(result.error);
			toast.error('Veuillez corriger les erreurs du formulaire');
			return false;
		}

		fieldErrors = {};
		return true;
	}

	function resetForm() {
		firstName = '';
		lastName = '';
		email = '';
		phone = '';
		address = '';
		city = '';
		postalCode = '';
		selectedDistrict = '';
		selectedRole = 'MANAGER';
		fieldErrors = {};
	}

	// ✅ HANDLER USE:ENHANCE
	const handleEnhance: SubmitFunction = () => {
		// ✅ Valide avant de soumettre
		if (!validateForm()) {
			return async () => {
				// Ne pas soumettre si erreurs
			};
		}

		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Bénévole créé avec succès');
				resetForm();
				open = false;
				await update();
			} else if (result.type === 'failure') {
				// ✅ Erreurs serveur (double validation)
				if (result.data?.errors) {
					fieldErrors = result.data.errors;
					toast.error('Erreurs de validation du serveur');
				} else {
					toast.error('Erreur lors de la création');
				}
				await update();
			} else if (result.type === 'error') {
				toast.error('Erreur serveur');
				console.error('Erreur:', result.error);
			}

			isSubmitting = false;
		};
	};
</script>

<!-- Template -->
<Dialog.Root bind:open onOpenChange={(value) => (open = value)}>
	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Créer un nouveau bénévole</Dialog.Title>
			<Dialog.Description>
				Remplissez tous les champs pour ajouter un nouveau bénévole au système
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createVolunteer" use:enhance={handleEnhance} class="space-y-6">
			<!-- ROW 1 -->
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-3">
					<Label for="firstName">Prénom *</Label>
					<Input
						id="firstName"
						name="firstName"
						bind:value={firstName}
						type="text"
						disabled={isSubmitting}
						placeholder="Jean"
						class={getFieldError(fieldErrors, 'firstName') ? 'border-red-500' : ''}
					/>
					{#if getFieldError(fieldErrors, 'firstName')}
						<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'firstName')}</p>
					{/if}
				</div>

				<div class="grid gap-3">
					<Label for="lastName">Nom *</Label>
					<Input
						id="lastName"
						name="lastName"
						bind:value={lastName}
						type="text"
						disabled={isSubmitting}
						placeholder="Dupont"
						class={getFieldError(fieldErrors, 'lastName') ? 'border-red-500' : ''}
					/>
					{#if getFieldError(fieldErrors, 'lastName')}
						<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'lastName')}</p>
					{/if}
				</div>
			</div>

			<!-- ROW 2 -->
			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-3">
					<Label for="email">Email *</Label>
					<Input
						id="email"
						name="email"
						bind:value={email}
						type="email"
						disabled={isSubmitting}
						placeholder="jean@example.com"
						class={getFieldError(fieldErrors, 'email') ? 'border-red-500' : ''}
					/>
					{#if getFieldError(fieldErrors, 'email')}
						<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'email')}</p>
					{/if}
				</div>

				<div class="grid gap-3">
					<Label for="phone">Téléphone *</Label>
					<Input
						id="phone"
						name="phone"
						bind:value={phone}
						type="tel"
						disabled={isSubmitting}
						placeholder="06 12 34 56 78"
						class={getFieldError(fieldErrors, 'phone') ? 'border-red-500' : ''}
					/>
					{#if getFieldError(fieldErrors, 'phone')}
						<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'phone')}</p>
					{/if}
				</div>
			</div>

			<!-- ROW 3 -->
			<section class="grid grid-cols-1 gap-4">
				<div class="grid gap-3">
					<Label for="address">Adresse *</Label>
					<Input
						id="address"
						name="address"
						bind:value={address}
						type="text"
						disabled={isSubmitting}
						placeholder="123 rue de la Paix"
						class={getFieldError(fieldErrors, 'address') ? 'border-red-500' : ''}
					/>
					{#if getFieldError(fieldErrors, 'address')}
						<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'address')}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-3">
						<Label for="city">Ville *</Label>
						<Input
							id="city"
							name="city"
							bind:value={city}
							type="text"
							disabled={isSubmitting}
							placeholder="Montpellier"
							class={getFieldError(fieldErrors, 'city') ? 'border-red-500' : ''}
						/>
						{#if getFieldError(fieldErrors, 'city')}
							<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'city')}</p>
						{/if}
					</div>

					<div class="grid gap-3">
						<Label for="postalCode">Code Postal *</Label>
						<Input
							id="postalCode"
							name="postalCode"
							bind:value={postalCode}
							type="text"
							disabled={isSubmitting}
							placeholder="34000"
							maxlength={5}
							class={getFieldError(fieldErrors, 'postalCode') ? 'border-red-500' : ''}
						/>
						{#if getFieldError(fieldErrors, 'postalCode')}
							<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'postalCode')}</p>
						{/if}
					</div>
				</div>

				<!-- Quartier / District -->
				<div class="grid gap-3">
					<Label for="district">Quartier</Label>
					<Select.Root type="single" bind:value={selectedDistrict} disabled={isSubmitting}>
						<Select.Trigger
							id="district"
							class={getFieldError(fieldErrors, 'district') ? 'border-red-500' : ''}
						>
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
					<input type="hidden" name="district" value={selectedDistrict} />
					{#if getFieldError(fieldErrors, 'district')}
						<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'district')}</p>
					{/if}
				</div>

				<!-- Rôle -->
				<div class="grid gap-3">
					<Label for="role">Rôle</Label>
					<Select.Root type="single" bind:value={selectedRole} disabled={isSubmitting}>
						<Select.Trigger
							id="role"
							class={getFieldError(fieldErrors, 'role') ? 'border-red-500' : ''}
						>
							{roleOptions.find((o) => o.value === selectedRole)?.label || 'Sélectionner un rôle'}
						</Select.Trigger>
						<Select.Content>
							{#each roleOptions as option (option.value)}
								<Select.Item value={option.value} label={option.label} />
							{/each}
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="role" value={selectedRole} />
					{#if getFieldError(fieldErrors, 'role')}
						<p class="text-xs text-red-500">{getFieldError(fieldErrors, 'role')}</p>
					{/if}
				</div>
			</section>

			<!-- BUTTONS -->
			<div class="grid grid-cols-2 gap-4">
				<Button
					type="button"
					variant="outline"
					disabled={isSubmitting}
					onclick={() => {
						open = false;
						resetForm();
					}}
				>
					Annuler
				</Button>

				<Button type="submit" disabled={isSubmitting} variant="default">
					{#if isSubmitting}
						<span class="mr-2">⏳</span>
						Création en cours...
					{:else}
						<span class="mr-2">✓</span>
						Créer le bénévole
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
