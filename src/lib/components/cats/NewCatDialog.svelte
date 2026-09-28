<script lang="ts">
	import { createCatSchema } from '$lib/schemas/cat';
	import { getFieldError } from '$lib/utils/zodErrors';
	import type { FlattenedErrors } from '$lib/utils/zodErrors';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import CheckboxField from '../fields/CheckboxField.svelte';
	import DatePicker from '../fields/DatePicker.svelte';
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
	import SwitchField from '../fields/SwitchField.svelte';
	import TextareaField from '../fields/TextareaField.svelte';
	import SectionCard from '../cards/SectionCard.svelte';
	import {
		CAT_SEX,
		CAT_STATUS,
		CAT_HAIR_LENGTH,
		CAT_VACCINATE,
		CAT_SECTION_CONFIG
	} from '$lib/constants/cat';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';

	let { open = $bindable(false), onCancel } = $props();
	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	// Identité
	let catNumber = $state('');
	let name = $state('');
	let sex = $state('UNKNOWN');
	let birthDate = $state<Date | undefined>(undefined);
	let status = $state('AVAILABLE');
	let isVisible = $state(true);

	// Profil
	let color = $state('');
	let hairLength = $state('');
	let origin = $state('');

	// Compatibilités
	let isOkDog = $state(false);
	let isOkCat = $state(false);
	let isOkChild = $state(false);
	let isOutside = $state(false);

	// Santé
	let vaccinate = $state('');
	let isFivTest = $state(false);
	let isDeworming = $state(false);
	let isSterilize = $state(false);
	let isAlreadySterilized = $state(false);
	let isIdentify = $state(false);
	let chipId = $state('');

	// Description
	let description = $state('');

	function validateForm(): boolean {
		const formData = {
			catNumber: catNumber.trim(),
			name: name.trim() || null,
			sex,
			birthDate: birthDate ? birthDate.toISOString().split('T')[0] : null,
			status,
			isVisible,

			color: color.trim() || null,
			hairLength: hairLength || null,
			origin: origin.trim() || null,

			isOkDog,
			isOkCat,
			isOkChild,
			isOutside,

			vaccinate: vaccinate || null,
			isFivTest,
			isDeworming,
			isSterilize,
			isAlreadySterilized,
			isIdentify,
			chipId: chipId.trim() || null,

			description: description.trim() || null
		};

		const result = createCatSchema.safeParse(formData);

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
		catNumber = '';
		name = '';
		sex = 'UNKNOWN';
		birthDate = undefined;
		status = 'AVAILABLE';
		isVisible = true;

		color = '';
		hairLength = '';
		origin = '';

		isOkDog = false;
		isOkCat = false;
		isOkChild = false;
		isOutside = false;

		vaccinate = '';
		isFivTest = false;
		isDeworming = false;
		isSterilize = false;
		isAlreadySterilized = false;
		isIdentify = false;
		chipId = '';

		description = '';

		fieldErrors = {};
	}

	const handleEnhance: SubmitFunction = () => {
		const isValid = validateForm();
		if (!isValid) {
			return async () => {};
		}

		isSubmitting = true;

		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success('Chat créé avec succès ✅');
				resetForm();
				open = false;
				await update();
			} else if (result.type === 'failure') {
				if (result.data?.errors) {
					fieldErrors = result.data.errors;
					toast.error('Erreurs de validation du serveur');
				} else {
					toast.error(result.data?.message || 'Erreur lors de la création');
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
		if (onCancel) onCancel();
		resetForm();
	};
</script>

<Dialog.Root bind:open onOpenChange={(value) => (open = value)}>
	<Dialog.Content size="lg" class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Créer un nouveau chat</Dialog.Title>
			<Dialog.Description>
				Seul le numéro de suivi (*) est obligatoire, les autres champs peuvent être complétés plus
				tard
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createCat" use:enhance={handleEnhance} class="space-y-6">
			<!-- Identité & Statut -->
			<section class="grid grid-cols-2 gap-4">
				<SectionCard
					icon={CAT_SECTION_CONFIG.statuts.icon}
					title={CAT_SECTION_CONFIG.statuts.label}
					color={CAT_SECTION_CONFIG.statuts.color}
				>
					<div class="grid grid-cols-2 gap-4">
						<InputField
							id="catNumber"
							name="catNumber"
							label="Numéro de suivi"
							bind:value={catNumber}
							placeholder="C2509026"
							error={getFieldError(fieldErrors, 'catNumber')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<SelectField
							id="status"
							name="status"
							label="Statut"
							bind:value={status}
							options={CAT_STATUS}
							size="sm"
							disabled={isSubmitting}
						/>

						<SwitchField
							id="isVisible"
							name="isVisible"
							label="Visibilité"
							checked={isVisible}
							checkedLabel="✓ Visible"
							uncheckedLabel="✗ Masqué"
							onChange={(value) => (isVisible = value)}
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<SectionCard
					icon={CAT_SECTION_CONFIG.profile.icon}
					title={CAT_SECTION_CONFIG.profile.label}
					color={CAT_SECTION_CONFIG.profile.color}
				>
					<div class="grid grid-cols-2 gap-x-4 gap-y-2">
						<InputField
							id="name"
							name="name"
							label="Nom"
							bind:value={name}
							placeholder="Sans nom"
							error={getFieldError(fieldErrors, 'name')}
							size="sm"
							disabled={isSubmitting}
						/>

						<SelectField
							id="sex"
							name="sex"
							label="Sexe"
							bind:value={sex}
							options={CAT_SEX}
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

						<InputField
							id="color"
							name="color"
							label="Couleur"
							bind:value={color}
							placeholder="Noir et blanc"
							size="sm"
							disabled={isSubmitting}
						/>

						<SelectField
							id="hairLength"
							name="hairLength"
							label="Longueur de poil"
							bind:value={hairLength}
							options={CAT_HAIR_LENGTH}
							size="sm"
							disabled={isSubmitting}
						/>

						<InputField
							id="origin"
							name="origin"
							label="Origine"
							bind:value={origin}
							placeholder="Association, particulier..."
							size="sm"
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>
			</section>

			<Separator />

			<!-- Compatibilités & Santé -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<SectionCard
					icon={CAT_SECTION_CONFIG.compatibility.icon}
					title={CAT_SECTION_CONFIG.compatibility.label}
					color={CAT_SECTION_CONFIG.compatibility.color}
				>
					<div class="grid grid-cols-2 gap-4">
						<CheckboxField
							id="isOkDog"
							name="isOkDog"
							label="OK Chien"
							checked={isOkDog}
							onChange={(value) => (isOkDog = value)}
							disabled={isSubmitting}
						/>
						<CheckboxField
							id="isOkCat"
							name="isOkCat"
							label="OK Chat"
							checked={isOkCat}
							onChange={(value) => (isOkCat = value)}
							disabled={isSubmitting}
						/>
						<CheckboxField
							id="isOkChild"
							name="isOkChild"
							label="OK Enfant"
							checked={isOkChild}
							onChange={(value) => (isOkChild = value)}
							disabled={isSubmitting}
						/>
						<CheckboxField
							id="isOutside"
							name="isOutside"
							label="OK Extérieur"
							checked={isOutside}
							onChange={(value) => (isOutside = value)}
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<SectionCard
					icon={CAT_SECTION_CONFIG.health.icon}
					title={CAT_SECTION_CONFIG.health.label}
					color={CAT_SECTION_CONFIG.health.color}
				>
					<div class="grid grid-cols-2 gap-4">
						<SelectField
							id="vaccinate"
							name="vaccinate"
							label="Vaccination"
							bind:value={vaccinate}
							options={CAT_VACCINATE}
							size="sm"
							disabled={isSubmitting}
						/>

						<InputField
							id="chipId"
							name="chipId"
							label="N° de puce"
							bind:value={chipId}
							placeholder="250269812345678"
							size="sm"
							disabled={isSubmitting}
						/>

						<CheckboxField
							id="isFivTest"
							name="isFivTest"
							label="Test FIV fait"
							checked={isFivTest}
							onChange={(value) => (isFivTest = value)}
							disabled={isSubmitting}
						/>
						<CheckboxField
							id="isDeworming"
							name="isDeworming"
							label="Vermifugé"
							checked={isDeworming}
							onChange={(value) => (isDeworming = value)}
							disabled={isSubmitting}
						/>
						<CheckboxField
							id="isSterilize"
							name="isSterilize"
							label="À stériliser"
							checked={isSterilize}
							onChange={(value) => (isSterilize = value)}
							disabled={isSubmitting}
						/>
						<CheckboxField
							id="isAlreadySterilized"
							name="isAlreadySterilized"
							label="Déjà stérilisé"
							checked={isAlreadySterilized}
							onChange={(value) => (isAlreadySterilized = value)}
							disabled={isSubmitting}
						/>
						<CheckboxField
							id="isIdentify"
							name="isIdentify"
							label="Identifié"
							checked={isIdentify}
							onChange={(value) => (isIdentify = value)}
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>
			</div>

			<Separator />

			<!-- Description -->
			<SectionCard
				icon={CAT_SECTION_CONFIG.description.icon}
				title={CAT_SECTION_CONFIG.description.label}
				color={CAT_SECTION_CONFIG.description.color}
			>
				<TextareaField
					id="description"
					name="description"
					label="Description"
					bind:value={description}
					placeholder="Caractère, histoire, particularités..."
					disabled={isSubmitting}
				/>
			</SectionCard>

			<Separator />

			<div>
				<SaveCancelButtons onCancel={handleCancelClick} isSaving={isSubmitting} />
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
