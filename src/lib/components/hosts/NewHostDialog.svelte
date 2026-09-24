<script lang="ts">
	import { createHostSchema } from '$lib/schemas/host';
	import { getFieldError } from '$lib/utils/zodErrors';
	import type { FlattenedErrors } from '$lib/utils/zodErrors';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
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
		HOST_TYPE_OPTIONS,
		HOST_HEAL_OPTIONS,
		HOST_SOCIALIZE_OPTIONS,
		HOST_BABY_FEEDING_OPTIONS,
		HOST_SECTION_CONFIG
	} from '$lib/constants/host';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';

	let { open = $bindable(false), onCancel } = $props();
	let isSaving = $state(false);
	let isSubmitting = $state(false);
	let fieldErrors: FlattenedErrors = $state({});

	// ✅ Profil fields
	let firstName = $state('');
	let lastName = $state('');
	let birthDate = $state<Date | undefined>(undefined);
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('Montpellier');
	let postalCode = $state('34000');
	let selectedDistrict = $state<string>('');

	// Host spécifiques
	let actif = $state('ACTIVE');
	let selectedType = $state<string>('CLASSIC');
	let isAvailable = $state(true);

	// Zone d'accueil
	let space = $state('');
	let outside = $state(false);
	let car = $state(false);
	let isStockFeed = $state(false);

	// Animaux
	let hasAnimalsAtHome = $state(false);
	let numberOfCatsAtHome = $state('');
	let numberOfDogsAtHome = $state('');
	let otherAnimalsAtHome = $state('');

	// Capacités
	let heal = $state<string>('NO');
	let socialize = $state<string>('NO');
	let babyFeeding = $state<string>('NO');

	// Cat
	let catAdult = $state('');
	let kittyAndKitten = $state(false);
	let kitten = $state('');

	let homeDescription = $state('');
	let presence = $state('');
	let outsideDescription = $state('');
	let additionalInformation = $state('');

	const districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([key, label]) => ({
			value: key,
			label
		}))
	);

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
			district: selectedDistrict || undefined,

			// Statut
			type: selectedType,
			actif: actif,
			isAvailable,

			// Zone d'accueil
			space: space ? parseInt(space) : null,
			outside: outside,
			car: car,
			isStockFeed: isStockFeed,

			// Animaux
			hasAnimalsAtHome,
			numberOfCatsAtHome: numberOfCatsAtHome ? parseInt(numberOfCatsAtHome) : null,
			numberOfDogsAtHome: numberOfDogsAtHome ? parseInt(numberOfDogsAtHome) : null,
			otherAnimalsAtHome: otherAnimalsAtHome?.trim() || undefined,

			// Capacités
			heal,
			socialize,
			babyFeeding,

			// Cat
			catAdult: numberOfCatsAtHome ? parseInt(numberOfCatsAtHome) : null,
			kittyAndKitten,
			Kitten: numberOfCatsAtHome ? parseInt(numberOfCatsAtHome) : null,

			// Descriptions
			homeDescription: homeDescription?.trim() || '',
			outsideDescription: outsideDescription?.trim() || undefined,
			additionalInformation: additionalInformation.trim() || '',
			presence: presence.trim() || undefined
		};

		const result = createHostSchema.safeParse(formData);

		if (!result.success) {
			const flattened = result.error.flatten();
			console.error('❌ Erreurs de validation:', flattened.fieldErrors);
			fieldErrors = flattened.fieldErrors as FlattenedErrors;
			toast.error('Veuillez corriger les erreurs du formulaire');
			return false;
		}

		console.log('✅ Validation réussie!', result.data);
		fieldErrors = {};
		return true;
	}

	function resetForm() {
		// Profil
		firstName = '';
		lastName = '';
		birthDate = undefined;
		email = '';
		phone = '';
		address = '';
		city = 'Montpellier';
		postalCode = '34000';
		selectedDistrict = '';

		// Host spécifiques
		actif = 'ACTIVE';
		selectedType = 'CLASSIC';
		isAvailable = true;

		// Zone d'accueil
		space = '';
		outside = false;
		car = false;
		isStockFeed = false;

		// Animaux
		hasAnimalsAtHome = false;
		numberOfCatsAtHome = '';
		numberOfDogsAtHome = '';
		otherAnimalsAtHome = '';

		// Capacités
		heal = 'NO';
		socialize = 'NO';
		babyFeeding = 'NO';

		// Cat
		catAdult = '';
		kittyAndKitten = false;
		kitten = '';

		// Descriptions
		homeDescription = '';
		presence = '';
		outsideDescription = '';
		additionalInformation = '';

		fieldErrors = {};
	}

	// ✅ HANDLER USE:ENHANCE
	const handleEnhance: SubmitFunction = () => {
		const isValid = validateForm();
		if (!isValid) {
			return async () => {}; // Doit bloquer
		}

		console.log('✅ Validation réussie - Soumission autorisée');
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
	<Dialog.Content size="lg" class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Créer un nouvel accueillant</Dialog.Title>
			<Dialog.Description>
				Remplissez les champs obligatoires (*) pour ajouter une nouvelle famille d'accueil
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createHost" use:enhance={handleEnhance} class="space-y-6">
			<!-- 📋 SECTION 1: Identité & Contact -->

			<section class="grid grid-cols-2 gap-4">
				<!-- Statu -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.statuts.icon}
					title={HOST_SECTION_CONFIG.statuts.label}
					color={HOST_SECTION_CONFIG.statuts.color}
				>
					<div class="grid grid-cols-2 gap-4">
						<SelectField
							id="type"
							name="type"
							label="Type d'accueil"
							bind:value={selectedType}
							options={HOST_TYPE_OPTIONS}
							size="sm"
							disabled={isSubmitting}
						/>

						<SwitchField
							id="isAvailable"
							name="isAvailable"
							label="Disponibilité"
							checked={isAvailable ?? false}
							checkedLabel="✓ Disponible"
							uncheckedLabel="✗ Indisponible"
							onChange={(value) => (isAvailable = value)}
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<!-- Profil -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.profile.icon}
					title={HOST_SECTION_CONFIG.profile.label}
					color={HOST_SECTION_CONFIG.profile.color}
				>
					<div class="col-span-2 grid grid-cols-2 gap-x-4 gap-y-2">
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
			</section>
			<Separator />

			<section class="grid grid-cols-2 gap-4">
				<!-- Adresse -->
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
					</div>
				</SectionCard>

				<!-- Contact -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.contact.icon}
					title={HOST_SECTION_CONFIG.contact.label}
					color={HOST_SECTION_CONFIG.contact.color}
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

			<!-- 📍 SECTION 2 -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-4">
				<!-- Zone d'accueil -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.home.icon}
					title={HOST_SECTION_CONFIG.home.label}
					color={HOST_SECTION_CONFIG.home.color}
				>
					<div class="space-y-4">
						<InputField
							id="space"
							name="space"
							label="Espace (m²)"
							type="number"
							bind:value={space}
							placeholder="60"
							error={getFieldError(fieldErrors, 'space')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<!-- ✅ CHECKBOXES REMPLACÉES -->
						<CheckboxField
							id="outside"
							name="outside"
							label="Extérieur"
							checked={outside}
							onChange={(value) => (outside = value)}
							disabled={isSubmitting}
						/>

						<CheckboxField
							id="car"
							name="car"
							label="Voiture"
							checked={car}
							onChange={(value) => (car = value)}
							disabled={isSubmitting}
						/>

						<CheckboxField
							id="isStockFeed"
							name="isStockFeed"
							label="Nourriture au stock"
							checked={isStockFeed}
							onChange={(value) => (isStockFeed = value)}
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<!-- Animaux -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.animals.icon}
					title={HOST_SECTION_CONFIG.animals.label}
					color={HOST_SECTION_CONFIG.animals.color}
				>
					<div class="space-y-4">
						<!-- ✅ CHECKBOX REMPLACÉE -->
						<CheckboxField
							id="hasAnimalsAtHome"
							name="hasAnimalsAtHome"
							label="Animaux à la maison"
							checked={hasAnimalsAtHome}
							onChange={(value) => (hasAnimalsAtHome = value)}
							disabled={isSubmitting}
						/>

						{#if hasAnimalsAtHome}
							<InputField
								id="numberOfCatsAtHome"
								name="numberOfCatsAtHome"
								label="Nombre de chats"
								type="number"
								bind:value={numberOfCatsAtHome}
								placeholder="0"
								size="sm"
								disabled={isSubmitting}
							/>

							<InputField
								id="numberOfDogsAtHome"
								name="numberOfDogsAtHome"
								label="Nombre de chiens"
								type="number"
								bind:value={numberOfDogsAtHome}
								placeholder="0"
								size="sm"
								disabled={isSubmitting}
							/>

							<TextareaField
								id="otherAnimalsAtHome"
								name="otherAnimalsAtHome"
								label="Autres animaux"
								bind:value={otherAnimalsAtHome}
								placeholder="Hamster, Oiseau..."
								disabled={isSubmitting}
							/>
						{/if}
					</div>
				</SectionCard>

				<!-- Capacités -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.capacity.icon}
					title={HOST_SECTION_CONFIG.capacity.label}
					color={HOST_SECTION_CONFIG.capacity.color}
				>
					<div class="grid grid-cols-1 gap-4">
						<SelectField
							id="heal"
							name="heal"
							label="Soins"
							bind:value={heal}
							options={HOST_HEAL_OPTIONS}
							size="sm"
							required
							disabled={isSubmitting}
						/>

						<SelectField
							id="socialize"
							name="socialize"
							label="Socialisation"
							bind:value={socialize}
							options={HOST_SOCIALIZE_OPTIONS}
							size="sm"
							required
							disabled={isSubmitting}
						/>

						<SelectField
							id="babyFeeding"
							name="babyFeeding"
							label="Biberonage"
							bind:value={babyFeeding}
							options={HOST_BABY_FEEDING_OPTIONS}
							size="sm"
							required
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<!-- Chat -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.cat.icon}
					title={HOST_SECTION_CONFIG.cat.label}
					color={HOST_SECTION_CONFIG.cat.color}
				>
					<div class="space-y-4">
						<InputField
							id="catAdult"
							name="catAdult"
							label="Chat adulte"
							type="number"
							bind:value={catAdult}
							placeholder="3"
							error={getFieldError(fieldErrors, 'catAdult')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<!-- ✅ CHECKBOXES REMPLACÉES -->
						<CheckboxField
							id="kittyAndKitten"
							name="kittyAndKitten"
							label="Chatte avec portée"
							checked={kittyAndKitten}
							onChange={(value) => (kittyAndKitten = value)}
							disabled={isSubmitting}
						/>

						<InputField
							id="kitten"
							name="kitten"
							label="Chat Chaton"
							type="number"
							bind:value={kitten}
							placeholder="4"
							error={getFieldError(fieldErrors, 'kitten')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>
			</div>

			<Separator />

			<!-- 📝 SECTION 4: Descriptions -->
			<section class="space-y-4">
				<SectionCard
					icon={HOST_SECTION_CONFIG.homeDescription.icon}
					title={HOST_SECTION_CONFIG.homeDescription.label}
					color={HOST_SECTION_CONFIG.homeDescription.color}
				>
					<TextareaField
						id="homeDescription"
						name="homeDescription"
						label="Description du logement"
						bind:value={homeDescription}
						placeholder="Décrivez votre logement, son ambiance, ses caractéristiques..."
						error={getFieldError(fieldErrors, 'homeDescription')}
						disabled={isSubmitting}
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
						bind:value={presence}
						placeholder="Décrivez la présence sur une semaine"
						error={getFieldError(fieldErrors, 'presence')}
						disabled={isSubmitting}
					/>
				</SectionCard>

				{#if outside}
					<SectionCard
						icon={HOST_SECTION_CONFIG.outsideDescription.icon}
						title={HOST_SECTION_CONFIG.outsideDescription.label}
						color={HOST_SECTION_CONFIG.outsideDescription.color}
					>
						<TextareaField
							id="outsideDescription"
							name="outsideDescription"
							label="Détails extérieur"
							bind:value={outsideDescription}
							placeholder="Jardin, balcon, terrasse..."
							error={getFieldError(fieldErrors, 'outsideDescription')}
							disabled={isSubmitting}
						/>
					</SectionCard>
				{/if}

				<SectionCard
					icon={HOST_SECTION_CONFIG.additionalInformation.icon}
					title={HOST_SECTION_CONFIG.additionalInformation.label}
					color={HOST_SECTION_CONFIG.additionalInformation.color}
				>
					<TextareaField
						id="additionalInformation"
						name="additionalInformation"
						label="Informations additionnelles"
						bind:value={additionalInformation}
						placeholder="Informations additionnelles..."
						error={getFieldError(fieldErrors, 'additionalInformation')}
						disabled={isSubmitting}
					/>
				</SectionCard>
			</section>

			<Separator />

			<!-- BUTTONS -->
			<div>
				<SaveCancelButtons onCancel={handleCancelClick} {isSaving} />
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
