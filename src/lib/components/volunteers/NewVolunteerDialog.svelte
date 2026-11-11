<script lang="ts">
	import { createVolunteerSchema } from '$lib/schemas/volunteer';
	import { flattenErrors, getFieldError } from '$lib/utils/zodErrors';
	import type { FlattenedErrors } from '$lib/utils/zodErrors';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance, type SubmitFunction } from '$app/forms';
	import SectionCard from '../cards/SectionCard.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { VOLUNTEER_SECTION_CONFIG, VOLUNTEER_ROLE_OPTIONS } from '$lib/constants/volunteer';
	import { format } from 'date-fns';

	let { open = $bindable(false), onCancel, initialData = null, formId = '' } = $props();

	$effect(() => {
		if (open && initialData) {
			firstName = initialData.firstName ?? '';
			lastName = initialData.lastName ?? '';
			email = initialData.email ?? '';
			phone = initialData.phone ?? '';
			address = initialData.address ?? '';
			city = initialData.city ?? '';
			postalCode = initialData.postalCode ?? '';
			birthDate = initialData.birthDate ? new Date(initialData.birthDate) : undefined;
			selectedDistrict = initialData.district ?? '';
		}
	});

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
			birthDate: birthDate ? format(birthDate, 'yyyy-MM-dd') : undefined,
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict || undefined,
			role: selectedRole
		});

		if (!result.success) {
			console.log('❌ Erreurs client:', result.error.flatten().fieldErrors);
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
	const handleEnhance: SubmitFunction = ({ formData, cancel }) => {
		if (!validateForm()) {
			cancel();
			return;
		}
		formData.append('formId', formId);
		isSubmitting = true;

		return async ({ result, update }) => {
			console.log('📦 Résultat serveur:', result);
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
<Dialog.Root bind:open>
	<!-- Hauteur limitée à l'écran visible : le contenu défile, le bouton reste en bas -->
	<Dialog.Content size="md" class="flex max-h-[90dvh] flex-col gap-0 p-0">
		<Dialog.Header class="p-4 sm:p-6">
			<Dialog.Title>Créer un nouveau bénévole</Dialog.Title>
			<Dialog.Description>
				Un email avec un mot de passe temporaire lui sera envoyé.
			</Dialog.Description>
		</Dialog.Header>

		<Separator />

		<form
			method="POST"
			action="?/createVolunteer"
			use:enhance={handleEnhance}
			class="flex min-h-0 flex-1 flex-col"
		>
			<!-- Zone qui défile -->
			<div class="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
				<!-- PROFIL -->
				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.profile.icon}
					title={VOLUNTEER_SECTION_CONFIG.profile.label}
					color={VOLUNTEER_SECTION_CONFIG.profile.color}
				>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
						<div class="sm:col-span-2">
							<DatePicker
								name="birthDate"
								value={birthDate}
								onSelect={(date) => (birthDate = date)}
								label="Date de naissance"
								error={getFieldError(fieldErrors, 'birthDate')}
							/>
						</div>
					</div>
				</SectionCard>

				<!-- CONTACT -->
				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.contact.icon}
					title={VOLUNTEER_SECTION_CONFIG.contact.label}
					color={VOLUNTEER_SECTION_CONFIG.contact.color}
				>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
							type="tel"
							bind:value={phone}
							placeholder="0612345678"
							error={getFieldError(fieldErrors, 'phone')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<!-- ADRESSE -->
				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.address.icon}
					title={VOLUNTEER_SECTION_CONFIG.address.label}
					color={VOLUNTEER_SECTION_CONFIG.address.color}
				>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="sm:col-span-2">
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
						</div>
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
							label="Code postal"
							bind:value={postalCode}
							placeholder="34000"
							error={getFieldError(fieldErrors, 'postalCode')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
						{#if city.trim().toLowerCase() === 'montpellier'}
							<div class="sm:col-span-2">
								<SelectField
									id="district"
									name="district"
									label="Quartier"
									bind:value={selectedDistrict}
									options={districtOptions}
									class="w-full"
									size="sm"
									disabled={isSubmitting}
								/>
							</div>
						{/if}
					</div>
				</SectionCard>

				<!-- RÔLE -->
				<SectionCard
					icon={VOLUNTEER_SECTION_CONFIG.statuts.icon}
					title={VOLUNTEER_SECTION_CONFIG.statuts.label}
					color={VOLUNTEER_SECTION_CONFIG.statuts.color}
				>
					<SelectField
						id="role"
						name="role"
						label="Rôle"
						bind:value={selectedRole}
						options={VOLUNTEER_ROLE_OPTIONS}
						class="w-full sm:w-64"
						size="sm"
						disabled={isSubmitting}
					/>
				</SectionCard>
			</div>

			<Separator />

			<!-- Pied fixe : toujours visible, même en faisant défiler le formulaire -->
			<div class="bg-muted/40 p-4 sm:px-6">
				<SaveCancelButtons onCancel={handleCancelClick} isSaving={isSubmitting} />
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
