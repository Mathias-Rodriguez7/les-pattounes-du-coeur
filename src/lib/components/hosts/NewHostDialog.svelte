<script lang="ts">
	import { createHostSchema } from '#lib/schemas/host.ts';
	import { getFieldError } from '#lib/utils/zodErrors.ts';
	import type { FlattenedErrors } from '#lib/utils/zodErrors.ts';
	import { DISTRICT_OPTIONS } from '#lib/utils/districts.ts';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { enhance, type SubmitFunction } from '$app/forms';
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
	} from '#lib/constants/host.ts';
	import SaveCancelButtons from '../buttons/SaveCancelButtons.svelte';
	import { format } from 'date-fns';

	let { open = $bindable(false), onCancel, initialData = null, formId = '' } = $props();

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

	// ✅ Host
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

	// Chats
	let catAdult = $state('');
	let kittyAndKitten = $state(false);
	let kitten = $state('');

	// Descriptions
	let homeDescription = $state('');
	let presence = $state('');
	let outsideDescription = $state('');
	let additionalInformation = $state('');

	// ✅ Pré-remplissage uniquement quand initialData change
	$effect(() => {
		if (open && initialData) {
			firstName = initialData.firstName ?? '';
			lastName = initialData.lastName ?? '';
			email = initialData.email ?? '';
			phone = initialData.phone ?? '';
			address = initialData.address ?? '';
			city = initialData.city ?? 'Montpellier';
			postalCode = initialData.postalCode ?? '34000';
			birthDate = initialData.birthDate ? new Date(initialData.birthDate) : undefined;
			selectedDistrict = initialData.district ?? '';
			space = initialData.space?.toString() ?? '';
			selectedType = initialData.type ?? 'CLASSIC';
			actif = initialData.actif ?? 'ACTIVE';
			isAvailable = initialData.isAvailable ?? true;
			outside = initialData.outside ?? false;
			car = initialData.car ?? false;
			isStockFeed = initialData.isStockFeed ?? false;
			hasAnimalsAtHome = initialData.hasAnimalsAtHome ?? false;
			numberOfCatsAtHome = initialData.numberOfCatsAtHome?.toString() ?? '';
			numberOfDogsAtHome = initialData.numberOfDogsAtHome?.toString() ?? '';
			otherAnimalsAtHome = initialData.otherAnimalsAtHome ?? '';
			heal = initialData.heal ?? 'NO';
			socialize = initialData.socialize ?? 'NO';
			babyFeeding = initialData.babyFeeding ?? 'NO';
			catAdult = initialData.catAdult?.toString() ?? '';
			kittyAndKitten = initialData.kittyAndKitten ?? false;
			kitten = initialData.kitten?.toString() ?? '';
			homeDescription = initialData.homeDescription ?? '';
			presence = initialData.presence ?? '';
			outsideDescription = initialData.outsideDescription ?? '';
			additionalInformation = initialData.additionalInformation ?? '';
		}
	});

	// ✅ VALIDATION CÔTÉ CLIENT
	function validateForm(): boolean {
		const formData = {
			// Profil
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			birthDate: birthDate ? format(birthDate, 'yyyy-MM-dd') : undefined,
			email: email.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict || undefined,

			// Statut
			type: selectedType,
			actif,
			isAvailable,

			// Zone d'accueil
			space: space ? parseInt(space) : undefined,
			outside,
			car,
			isStockFeed,

			// Animaux
			hasAnimalsAtHome,
			numberOfCatsAtHome: numberOfCatsAtHome ? parseInt(numberOfCatsAtHome) : null,
			numberOfDogsAtHome: numberOfDogsAtHome ? parseInt(numberOfDogsAtHome) : null,
			otherAnimalsAtHome: otherAnimalsAtHome.trim() || undefined,

			// Capacités
			heal,
			socialize,
			babyFeeding,

			// Chats
			catAdult: catAdult ? parseInt(catAdult) : 0,
			kittyAndKitten,
			kitten: kitten ? parseInt(kitten) : 0,

			// Descriptions
			homeDescription: homeDescription.trim(),
			presence: presence.trim(),
			outsideDescription: outsideDescription.trim() || undefined,
			additionalInformation: additionalInformation.trim() || undefined
		};

		const result = createHostSchema.safeParse(formData);

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

		actif = 'ACTIVE';
		selectedType = 'CLASSIC';
		isAvailable = true;

		space = '';
		outside = false;
		car = false;
		isStockFeed = false;

		hasAnimalsAtHome = false;
		numberOfCatsAtHome = '';
		numberOfDogsAtHome = '';
		otherAnimalsAtHome = '';

		heal = 'NO';
		socialize = 'NO';
		babyFeeding = 'NO';

		catAdult = '';
		kittyAndKitten = false;
		kitten = '';

		homeDescription = '';
		presence = '';
		outsideDescription = '';
		additionalInformation = '';

		fieldErrors = {};
	}

	// ✅ HANDLER USE:ENHANCE
	const handleEnhance: SubmitFunction = ({ formData, cancel }) => {
		if (!validateForm()) {
			cancel();
			return;
		}

		// Booléens envoyés explicitement, indépendamment du rendu DOM
		formData.set('actif', actif);
		formData.set('isAvailable', String(isAvailable));
		formData.set('outside', String(outside));
		formData.set('car', String(car));
		formData.set('isStockFeed', String(isStockFeed));
		formData.set('hasAnimalsAtHome', String(hasAnimalsAtHome));
		formData.set('kittyAndKitten', String(kittyAndKitten));
		formData.set('formId', formId);

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
		open = false;
		onCancel?.();
	};
</script>

<!-- Template -->
<Dialog.Root bind:open>
	<Dialog.Content size="xl" class="max-h-[90dvh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Créer une nouvelle famille d'accueil</Dialog.Title>
			<Dialog.Description>
				Remplissez les champs obligatoires (*) pour ajouter une nouvelle famille d'accueil
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createHost" use:enhance={handleEnhance} class="space-y-6">
			<!-- SECTION 1 : PC 4 colonnes (comme avant) | Tablette 2 | Mobile 1 -->
			<section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Statut -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.statuts.icon}
					title={HOST_SECTION_CONFIG.statuts.label}
					color={HOST_SECTION_CONFIG.statuts.color}
				>
					<div class="grid gap-4">
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
					<div class="grid gap-4">
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

						<!-- Ville et CP côte à côte, comme avant -->
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
								label="Code postal"
								bind:value={postalCode}
								placeholder="34000"
								error={getFieldError(fieldErrors, 'postalCode')}
								required
								size="sm"
								disabled={isSubmitting}
							/>
						</div>

						{#if city.trim().toLowerCase() === 'montpellier'}
							<SelectField
								id="district"
								name="district"
								label="Quartier"
								bind:value={selectedDistrict}
								placeholder="Quartier"
								options={DISTRICT_OPTIONS}
								size="sm"
								disabled={isSubmitting}
							/>
						{/if}
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
			</section>

			<Separator />

			<!-- SECTION 2 : PC 4 colonnes (comme avant) | Tablette 2 | Mobile 1 -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
							label="Nourriture en stock"
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
								placeholder="Hamster, oiseau..."
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
							label="Biberonnage"
							bind:value={babyFeeding}
							options={HOST_BABY_FEEDING_OPTIONS}
							size="sm"
							required
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<!-- Chats -->
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
							label="Chaton"
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

			<!-- SECTION 3 : Descriptions (inchangé) -->
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

			<SaveCancelButtons onCancel={handleCancelClick} isSaving={isSubmitting} />
		</form>
	</Dialog.Content>
</Dialog.Root>
