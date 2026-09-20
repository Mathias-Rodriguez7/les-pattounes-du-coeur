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
	import InputField from '../fields/InputField.svelte';
	import SelectField from '../fields/SelectField.svelte';
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

	// Profil fields
	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let phone = $state('');
	let address = $state('');
	let city = $state('Montpellier');
	let postalCode = $state('34000');
	let selectedDistrict = $state<string>('');

	// Host fields
	let age = $state('');
	let selectedType = $state<string>('CLASSIC');
	let space = $state('');
	let homeDescription = $state('');
	let presence = $state('');
	let hasAnimalsAtHome = $state(false);
	let numberOfCatsAtHome = $state('');
	let numberOfDogsAtHome = $state('');
	let otherAnimalsAtHome = $state('');
	let outside = $state(false);
	let outsideDescription = $state('');
	let isStockFeed = $state(false);
	let car = $state(false);
	let heal = $state<string>('NO');
	let socialize = $state<string>('NO');
	let babyFeeding = $state<string>('NO');
	let availabilityDuration = $state('');
	let additionalInformation = $state('');

	const districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([key, label]) => ({
			value: key,
			label
		}))
	);

	const sectionColors = {
		profile: 'emerald',
		address: 'gray',
		home: 'blue',
		animals: 'orange',
		capacity: 'indigo',
		availability: 'emerald',
		homeDescription: 'blue',
		outsideDescription: 'green',
		stopActivity: 'red',
		additionalInformation: 'gray'
	} as const satisfies Record<keyof typeof HOST_SECTION_CONFIG, string>;

	// ✅ VALIDATION CÔTÉ CLIENT
	function validateForm(): boolean {
		const formData = {
			// Profil
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email.trim(),
			phone: phone.trim(),
			age: age ? parseInt(age) : undefined,
			job: job.trim(),

			// Adresse
			address: address.trim(),
			city: city.trim(),
			postalCode: postalCode.trim(),
			district: selectedDistrict || undefined,

			// Zone d'accueil
			type: selectedType,
			space: space,
			presence: presence.trim(),
			outside,
			car,
			isStockFeed,

			// Animaux
			hasAnimalsAtHome,
			numberOfCatsAtHome: numberOfCatsAtHome ? parseInt(numberOfCatsAtHome) : null,
			numberOfDogsAtHome: numberOfDogsAtHome ? parseInt(numberOfDogsAtHome) : null,
			otherAnimalsAtHome: otherAnimalsAtHome?.trim() || undefined,

			// Capacités
			heal: heal,
			socialize: socialize,
			babyFeeding: babyFeeding,
			availabilityDuration: availabilityDuration.trim(),

			// Descriptions
			homeDescription: homeDescription?.trim() || '',
			outsideDescription: outsideDescription.trim() || undefined,
			additionalInformation: additionalInformation.trim() || ''
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
		firstName = '';
		lastName = '';
		email = '';
		phone = '';
		address = '';
		city = 'Montpellier';
		postalCode = '34000';
		selectedDistrict = '';
		age = '';
		job = '';
		selectedType = 'CLASSIC';
		space = 'MEDIUM';
		homeDescription = '';
		presence = '';
		hasAnimalsAtHome = false;
		numberOfCatsAtHome = '';
		numberOfDogsAtHome = '';
		otherAnimalsAtHome = '';
		outside = false;
		outsideDescription = '';
		isStockFeed = false;
		car = false;
		heal = 'NO';
		socialize = 'NO';
		babyFeeding = 'NO';
		availabilityDuration = '';
		additionalInformation = '';
		fieldErrors = {};
	}

	// ✅ HANDLER USE:ENHANCE
	const handleEnhance: SubmitFunction = () => {
		if (!validateForm()) {
			return async () => {};
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
		console.log('❌ Édition annulée');
		if (onCancel) {
			onCancel();
		}
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
			<SectionCard
				icon={HOST_SECTION_CONFIG.profile.icon}
				title="Informations Personnelles"
				color={sectionColors.profile}
			>
				<div class="space-y-4">
					<!-- ROW 1: Prénom & Nom -->
					<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
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

					<!-- ROW 2: Âge & Profession -->
					<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
						<InputField
							id="age"
							name="age"
							label="Âge"
							type="number"
							bind:value={age}
							placeholder="30"
							error={getFieldError(fieldErrors, 'age')}
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<SelectField
							id="type"
							name="type"
							label="Type d'accueil"
							bind:value={selectedType}
							options={HOST_TYPE_OPTIONS}
							size="sm"
							required
							disabled={isSubmitting}
						/>
					</div>
				</div>
			</SectionCard>

			<Separator />

			<!-- 📍 SECTION 2: Adresse & Zone -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<!-- Adresse -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.address.icon}
					title="Adresse"
					color={sectionColors.address}
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

						<div class="grid grid-cols-2 gap-4">
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

						<SelectField
							id="district"
							name="district"
							label="Quartier"
							bind:value={selectedDistrict}
							options={districtOptions}
							size="sm"
							disabled={isSubmitting}
						/>
					</div>
				</SectionCard>

				<!-- Zone d'accueil -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.home.icon}
					title="Zone d'Accueil"
					color={sectionColors.home}
				>
					<div class="space-y-4">
						<InputField
							id="space"
							name="space"
							label="m2"
							bind:value={space}
							placeholder="60"
							required
							size="sm"
							disabled={isSubmitting}
						/>

						<TextareaField
							id="presence"
							name="presence"
							label="Présence à domicile"
							bind:value={presence}
							placeholder="Tout le jour, Soir/WE, etc."
							error={getFieldError(fieldErrors, 'presence')}
							disabled={isSubmitting}
						/>

						<div class="space-y-2">
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={outside}
									disabled={isSubmitting}
									value="true"
									class="h-4 w-4 rounded border-gray-300"
								/>
								<span class="text-xs font-medium text-gray-700">Accès à l'extérieur</span>
							</label>
							<input type="hidden" name="outside" value={outside ? 'true' : 'false'} />

							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={car}
									disabled={isSubmitting}
									value="true"
									class="h-4 w-4 rounded border-gray-300"
								/>
								<span class="text-xs font-medium text-gray-700">Transport en voiture</span>
							</label>
							<input type="hidden" name="car" value={car ? 'true' : 'false'} />

							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={isStockFeed}
									disabled={isSubmitting}
									value="true"
									class="h-4 w-4 rounded border-gray-300"
								/>
								<span class="text-xs font-medium text-gray-700">Nourriture en stock</span>
							</label>
							<input type="hidden" name="isStockFeed" value={isStockFeed ? 'true' : 'false'} />
						</div>
					</div>
				</SectionCard>

				<!-- Animaux -->
				<SectionCard
					icon={HOST_SECTION_CONFIG.animals.icon}
					title="Animaux"
					color={sectionColors.animals}
				>
					<div class="space-y-4">
						<label class="flex items-center gap-2">
							<input
								type="checkbox"
								bind:checked={hasAnimalsAtHome}
								disabled={isSubmitting}
								value="true"
								class="h-4 w-4 rounded border-gray-300"
							/>
							<span class="text-xs font-medium text-gray-700">Animaux à la maison</span>
						</label>
						<input
							type="hidden"
							name="hasAnimalsAtHome"
							value={hasAnimalsAtHome ? 'true' : 'false'}
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
			</div>

			<Separator />

			<!-- 💪 SECTION 3: Capacités -->
			<section class="grid grid-cols-3 gap-4">
				<div class="col-span-2">
					<SectionCard
						icon={HOST_SECTION_CONFIG.capacity.icon}
						title="Capacités"
						color={sectionColors.capacity}
					>
						<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
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
				</div>
				<div class="col-span-1">
					<SectionCard
						icon={HOST_SECTION_CONFIG.availability.icon}
						title={HOST_SECTION_CONFIG.availability.label}
						color={sectionColors.availability}
					>
						<InputField
							id="availabilityDuration"
							name="availabilityDuration"
							label="Durée disponibilité"
							bind:value={availabilityDuration}
							placeholder="1 mois, 3 mois..."
							error={getFieldError(fieldErrors, 'availabilityDuration')}
							required
							size="sm"
							disabled={isSubmitting}
						/>
					</SectionCard>
				</div>
			</section>

			<Separator />

			<!-- 📝 SECTION 4: Descriptions -->
			<section class="space-y-4">
				<SectionCard
					icon={HOST_SECTION_CONFIG.homeDescription.icon}
					title={HOST_SECTION_CONFIG.homeDescription.label}
					color={sectionColors.homeDescription}
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

				{#if outside}
					<SectionCard
						icon={HOST_SECTION_CONFIG.outsideDescription.icon}
						title={HOST_SECTION_CONFIG.outsideDescription.label}
						color={sectionColors.outsideDescription}
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
					color={sectionColors.additionalInformation}
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
