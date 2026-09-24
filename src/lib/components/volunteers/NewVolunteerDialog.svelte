<script lang="ts">
	import { createVolunteerSchema } from '$lib/schemas/volunteer';
	import { flattenErrors, getFieldError } from '$lib/utils/zodErrors';
	import type { FlattenedErrors } from '$lib/utils/zodErrors';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SectionCard from '../cards/SectionCard.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { VOLUNTEER_SECTION_CONFIG, VOLUNTEER_ROLE_OPTIONS } from '$lib/constants/volunteer';

	let { open = $bindable(false), onCancel } = $props();
	let isSaving = $state(false);
	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	let firstName = $state('');
	let lastName = $state('');
	let birthDate = $state<Date | undefined>(undefined);
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('');
	let postalCode = $state('');
	let selectedDistrict = $state<string>('');
	let selectedRole = $state<string>('MANAGER');

	const districtOptions = Object.entries(DISTRICT_LABELS).map(([key, label]) => ({
		value: key,
		label
	}));

	// ✅ VALIDATION CÔTÉ CLIENT
	function validateForm(): boolean {
		const result = createVolunteerSchema.safeParse({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			birthDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict || undefined,
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
		birthDate = undefined;
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
			return async () => {};
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

	const handleCancelClick = () => {
		console.log('❌ Création annulée');
		if (onCancel) {
			onCancel();
		}
		resetForm();
	};
</script>

<!-- Template -->
<Dialog.Root bind:open onOpenChange={(value) => (open = value)}>
	<Dialog.Content size="md" class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Créer un nouveau bénévole</Dialog.Title>
			<Dialog.Description>
				Remplissez tous les champs pour ajouter un nouveau bénévole au système
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createVolunteer" use:enhance={handleEnhance} class="space-y-6">
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
						bind:value={firstName}
						placeholder="Jean"
						error={getFieldError(fieldErrors, 'firstName')}
						required
						size="sm"
						disabled={isSubmitting}
					/>

					<InputField
						id="lastName"
						name="lastName"
						label="Nom"
						bind:value={lastName}
						placeholder="Dupont"
						error={getFieldError(fieldErrors, 'lastName')}
						required
						size="sm"
						disabled={isSubmitting}
					/>

					<DatePicker
						name="birthDate"
						value={birthDate}
						onSelect={(date) => (birthDate = date)}
						label="Date de naissance"
						error={getFieldError(fieldErrors, 'birthDate')}
					/>
				</div>
			</SectionCard>
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
							bind:value={address}
							placeholder="123 rue de la Paix"
							error={getFieldError(fieldErrors, 'address')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
						<div class="flex gap-4">
							<InputField
								id="city"
								name="city"
								label="Ville"
								bind:value={city}
								placeholder="Montpellier"
								error={getFieldError(fieldErrors, 'city')}
								required
								size="sm"
								disabled={isSubmitting}
							/>

							<InputField
								id="postalCode"
								name="postalCode"
								label="Code Postal"
								bind:value={postalCode}
								placeholder="34000"
								error={getFieldError(fieldErrors, 'postalCode')}
								required
								size="sm"
								disabled={isSubmitting}
							/>
						</div>
						{#if city.toLowerCase() === 'montpellier'}
							<SelectField
								id="district"
								name="district"
								label="Quartier"
								bind:value={selectedDistrict}
								options={districtOptions}
								size="sm"
								disabled={isSubmitting}
							/>
						{/if}
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
							id="email"
							name="email"
							label="Email"
							type="email"
							bind:value={email}
							placeholder="jean@example.com"
							error={getFieldError(fieldErrors, 'email')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<InputField
							id="phone"
							name="phone"
							label="Téléphone"
							bind:value={phone}
							placeholder="06 12 34 56 78"
							error={getFieldError(fieldErrors, 'phone')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>
			</section>
			<Separator />

			<!-- Statu -->
			<SectionCard
				icon={VOLUNTEER_SECTION_CONFIG.statuts.icon}
				title={VOLUNTEER_SECTION_CONFIG.statuts.label}
				color={VOLUNTEER_SECTION_CONFIG.statuts.color}
			>
				<SelectField
					id="selectedRole"
					name="selectedRole"
					label="Sélectionner un rôle"
					bind:value={selectedRole}
					options={VOLUNTEER_ROLE_OPTIONS}
					size="sm"
					disabled={isSubmitting}
				/>
			</SectionCard>

			<Separator />

			<!-- BUTTONS -->
			<div>
				<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
