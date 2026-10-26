<script lang="ts">
	import { createAdoptionSchema } from '$lib/schemas/adoption';
	import { getFieldError } from '$lib/utils/zodErrors';
	import type { FlattenedErrors } from '$lib/utils/zodErrors';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button';
	import { FileText, Trash } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import { HOST_SECTION_CONFIG } from '$lib/constants/host';
	import SaveCancelButtons from '$lib/components/buttons/SaveCancelButtons.svelte';

	let { open = $bindable(false), onCancel, initialData = null, formId = '', catId = '' } = $props();

	let isSaving = $state(false);
	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	// ✅ Profil
	let firstName = $state('');
	let lastName = $state('');
	let birthDate = $state<Date | undefined>(undefined);
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('Montpellier');
	let postalCode = $state('34000');
	let selectedDistrict = $state<string>('');

	// ✅ Document
	let documentFile = $state<File | null>(null);
	let fileError = $state<string | null>(null);
	let documentInput: HTMLInputElement | undefined = $state();

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
	const ACCEPTED_TYPES = ['application/pdf'];

	const districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([key, label]) => ({
			value: key,
			label
		}))
	);

	// ✅ Pré-remplissage uniquement quand initialData change
	$effect(() => {
		if (initialData) {
			firstName = initialData.firstName ?? '';
			lastName = initialData.lastName ?? '';
			email = initialData.email ?? '';
			phone = initialData.phone ?? '';
			address = initialData.address ?? '';
			city = initialData.city ?? 'Montpellier';
			postalCode = initialData.postalCode ?? '34000';
			birthDate = initialData.birthDate ? new Date(initialData.birthDate) : undefined;
			selectedDistrict = initialData.district ?? '';
		}
	});

	// ✅ Gestion du document
	function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;

		fileError = null;
		input.value = ''; // permet de re-sélectionner le même fichier après suppression

		if (!file) return;

		if (!ACCEPTED_TYPES.includes(file.type)) {
			fileError = 'Le document doit être un PDF';
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			fileError = 'Le fichier dépasse 10 Mo';
			return;
		}

		documentFile = file;
	}

	function removeDocument() {
		documentFile = null;
		fileError = null;
	}

	// ✅ VALIDATION CÔTÉ CLIENT
	function validateForm(): boolean {
		const formData = {
			// Profil
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			birthDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict || undefined
		};

		const result = createAdoptionSchema.safeParse(formData);

		if (!result.success) {
			const flattened = result.error.flatten();
			console.error('❌ Erreurs de validation:', flattened.fieldErrors);
			fieldErrors = flattened.fieldErrors as FlattenedErrors;
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
		city = 'Montpellier';
		postalCode = '34000';
		selectedDistrict = '';
		documentFile = null;
		fileError = null;

		fieldErrors = {};
	}

	// ✅ HANDLER USE:ENHANCE
	const handleEnhance: SubmitFunction = ({ formData, cancel }) => {
		if (!validateForm()) {
			cancel();
			return;
		}

		formData.set('formId', formId);
		formData.set('catId', catId);

		if (documentFile) {
			formData.set('document', documentFile);
		}

		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('FA créé avec succès ✅');
				resetForm();
				open = false;
				await update();
			} else if (result.type === 'failure') {
				if (result.data?.errors) {
					fieldErrors = result.data.errors;
					toast.error('Erreurs de validation du serveur');
				} else {
					toast.error(result.data?.message ?? 'Erreur lors de la création');
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
		if (onCancel) {
			onCancel();
		}
		resetForm();
	};
</script>

<!-- Template -->
<Dialog.Root bind:open onOpenChange={(value) => (open = value)}>
	<Dialog.Content size="lg" class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Vérifier les informations pour valider l'adoption</Dialog.Title>
			<Dialog.Description>
				Remplissez les champs obligatoires (*) pour ajouter une nouvelle famille d'accueil
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createAdoption" use:enhance={handleEnhance} class="space-y-6">
			<input type="hidden" name="catId" value={catId} />
			<input type="hidden" name="formId" value={formId} />
			<!-- 📋 SECTION 1: Identité & Contact -->
			<section class="grid grid-cols-2 gap-4">
				<!-- Profil -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.profile.icon}
					title={HOST_SECTION_CONFIG.profile.label}
					color={HOST_SECTION_CONFIG.profile.color}
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

				<!-- Contact -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.contact.icon}
					title={HOST_SECTION_CONFIG.contact.label}
					color={HOST_SECTION_CONFIG.contact.color}
				>
					<div class="grid gap-4">
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

				<!-- Adresse -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.address.icon}
					title={HOST_SECTION_CONFIG.address.label}
					color={HOST_SECTION_CONFIG.address.color}
					class="col-span-2"
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
						<div class="grid grid-cols-3 gap-4">
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

							{#if city.toLowerCase() === 'montpellier'}
								<SelectField
									id="district"
									name="district"
									label="Quartier"
									bind:value={selectedDistrict}
									placeholder="Quartier"
									options={districtOptions}
									size="sm"
									disabled={isSubmitting}
								/>
							{/if}
						</div>
					</div>
				</SectionCard>
			</section>

			<!-- ================= DOCUMENT ================= -->
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold">Contrat et PDF</h3>
					<Button
						type="button"
						variant="outline"
						disabled={isSubmitting || !!documentFile}
						onclick={() => documentInput?.click()}
					>
						<FileText class="mr-2 h-4 w-4" />
						Ajouter un document
					</Button>
				</div>

				<input
					bind:this={documentInput}
					type="file"
					accept="application/pdf"
					class="hidden"
					onchange={handleFileChange}
				/>

				{#if documentFile}
					<ul>
						<li class="flex items-center justify-between gap-4 border-b p-3 last:border-b-0">
							<div class="flex items-center gap-3 truncate">
								<FileText class="h-5 w-5 text-red-500" />
								<span class="truncate">{documentFile.name}</span>
							</div>
							<button
								type="button"
								onclick={removeDocument}
								disabled={isSubmitting}
								class="text-muted-foreground hover:text-destructive p-2"
								aria-label="Supprimer le document"
							>
								<Trash class="h-4 w-4" />
							</button>
						</li>
					</ul>
				{:else}
					<div
						class="text-muted-foreground flex h-32 items-center justify-center rounded-xl border-2 border-dashed"
					>
						Aucun document
					</div>
				{/if}

				{#if fileError}
					<p class="text-destructive text-xs">{fileError}</p>
				{/if}
			</section>

			<!-- BUTTONS -->
			<div>
				<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
