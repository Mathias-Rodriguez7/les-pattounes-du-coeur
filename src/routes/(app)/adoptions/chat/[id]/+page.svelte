<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ChevronRight, ChevronLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		QuickAdoptionFormSchema,
		step1Schema,
		step2Schema
	} from '$lib/schemas/formShema/quickAdoptionForm';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { get } from 'svelte/store';
	import type { Cat } from '$lib/types/cat';
	import { fade, fly } from 'svelte/transition';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';
	import CheckboxField from '$lib/components/fields/CheckboxField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import { FORM_SECTION_CONFIG } from '$lib/constants/forms';

	let {
		data
	}: {
		data: {
			cat: Cat;
			form: SuperValidated<Infer<typeof QuickAdoptionFormSchema>>;
		};
	} = $props();

	// ✅ FORM CONFIG
	const form = superForm(data.form, {
		validators: zod4Client(QuickAdoptionFormSchema),

		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Demande envoyée avec succès 🎉');
				form.reset();
				step = 1;
			}

			if (result.type === 'failure') {
				console.log('❌ FORM FAILURE:', result);
				toast.error('Erreur: ' + JSON.stringify(result));
			}
		}
	});

	// ⚠️ IMPORTANT
	const { form: formData, enhance, errors } = form;

	// DatePicker manipule un Date, le schéma attend 'YYYY-MM-DD'
	let birthDate = $state<Date | undefined>(undefined);
	function onBirthDateSelect(date: Date) {
		birthDate = date;
		$formData.birthDate = date.toISOString().split('T')[0] as never;
	}

	const districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([value, label]) => ({ value, label }))
	);

	// ✅ STATE
	let step = $state(1);
	const totalSteps = 2;

	const progress = $derived((step / totalSteps) * 100);

	const catName = data.cat.name;

	// ✅ VALIDATION STEP
	function validateCurrentStep() {
		if (step === 1) {
			return step1Schema.safeParse(get(formData)).success;
		}

		if (step === 2) {
			return step2Schema.safeParse(get(formData)).success;
		}

		return true;
	}

	function nextStep() {
		if (!validateCurrentStep()) return;
		if (step < totalSteps) step++;
	}

	function prevStep() {
		if (step > 1) step--;
	}
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="p-8">
		<Card.Root class="mx-auto w-full max-w-xl">
			<Card.Header class="gap-4 text-center">
				<Card.Title>Trouvez votre futur compagnon</Card.Title>

				<Card.Description class="space-y-3 text-left leading-relaxed">
					<p>
						Vous souhaitez adopter <strong>{catName}</strong> 🐱, mais vous ne savez pas encore si c’est
						le bon compagnon pour vous ?
					</p>

					<p>
						Nous pouvons vous aider à voir si {catName} correspond à votre mode de vie.
					</p>

					<p>
						En remplissant ce formulaire, nous analyserons votre profil pour {catName}.
					</p>
				</Card.Description>
			</Card.Header>

			<Card.Content>
				<form method="POST" use:enhance class="space-y-6">
					<!-- 👤 STEP 1 : PROFIL -->
					<div class:hidden={step !== 1} class="space-y-4">
						<SectionCard
							icon={FORM_SECTION_CONFIG.profile.icon}
							title={FORM_SECTION_CONFIG.profile.label}
							color={FORM_SECTION_CONFIG.profile.color}
						>
							<div class="grid grid-cols-2 gap-4">
								<InputField
									id="firstName"
									name="firstName"
									label="Prénom"
									required
									size="sm"
									bind:value={$formData.firstName}
									placeholder="Jean"
									error={$errors.firstName?.[0]}
								/>
								<InputField
									id="lastName"
									name="lastName"
									label="Nom"
									required
									size="sm"
									bind:value={$formData.lastName}
									placeholder="Dupont"
									error={$errors.lastName?.[0]}
								/>
								<DatePicker
									name="birthDate"
									value={birthDate}
									onSelect={onBirthDateSelect}
									label="Date de naissance"
									error={$errors.birthDate?.[0]}
								/>
							</div>
						</SectionCard>

						<SectionCard
							icon={FORM_SECTION_CONFIG.contact.icon}
							title={FORM_SECTION_CONFIG.contact.label}
							color={FORM_SECTION_CONFIG.contact.color}
						>
							<div class="grid grid-cols-2 gap-2">
								<InputField
									id="email"
									name="email"
									label="Email"
									type="email"
									required
									size="sm"
									bind:value={$formData.email}
									placeholder="jean@example.com"
									error={$errors.email?.[0]}
								/>
								<InputField
									id="phone"
									name="phone"
									label="Téléphone"
									required
									size="sm"
									placeholder="06 12 34 56 78"
									bind:value={$formData.phone}
									error={$errors.phone?.[0]}
								/>
							</div>
						</SectionCard>

						<SectionCard
							icon={FORM_SECTION_CONFIG.address.icon}
							title={FORM_SECTION_CONFIG.address.label}
							color={FORM_SECTION_CONFIG.address.color}
						>
							<div class="space-y-4">
								<InputField
									id="address"
									name="address"
									label="Adresse"
									required
									size="sm"
									bind:value={$formData.address}
									placeholder="123 rue de la Paix"
									error={$errors.address?.[0]}
								/>
								<div class="grid grid-cols-3 gap-4">
									<InputField
										id="city"
										name="city"
										label="Ville"
										required
										size="sm"
										bind:value={$formData.city}
										placeholder="Montpellier"
										error={$errors.city?.[0]}
									/>
									<InputField
										id="postalCode"
										name="postalCode"
										label="Code postal"
										required
										size="sm"
										bind:value={$formData.postalCode}
										placeholder="34000"
										error={$errors.postalCode?.[0]}
									/>
									{#if $formData.city?.toLowerCase() === 'montpellier'}
										<SelectField
											id="district"
											name="district"
											label="Quartier"
											placeholder="Quartier"
											size="sm"
											options={districtOptions}
											bind:value={$formData.district}
										/>
									{/if}
								</div>
							</div>
						</SectionCard>

						<p class="text-muted-foreground text-xs">
							<span class="text-destructive">*</span> Champs obligatoires
						</p>
					</div>

					<!-- 🏠 STEP 2 -->
					<div class:hidden={step !== 2} class="space-y-4">
						<SectionCard
							icon={FORM_SECTION_CONFIG.home.icon}
							title={FORM_SECTION_CONFIG.home.label}
							color={FORM_SECTION_CONFIG.home.color}
						>
							<div class="space-y-4">
								<InputField
									id="housingSize"
									name="housingSize"
									label="Logement (m²)"
									type="number"
									required
									size="sm"
									bind:value={$formData.housingSize}
									error={$errors.housingSize?.[0]}
								/>

								<CheckboxField
									id="hasGarden"
									name="hasGarden"
									label="J'ai un jardin"
									checked={$formData.hasGarden}
									onChange={(v) => ($formData.hasGarden = v)}
								/>

								{#if $formData.hasGarden}
									<InputField
										id="gardenSize"
										name="gardenSize"
										label="Taille du jardin (m²)"
										type="number"
										size="sm"
										bind:value={$formData.gardenSize}
										error={$errors.gardenSize?.[0]}
									/>
								{/if}
							</div>
						</SectionCard>

						<SectionCard
							icon={FORM_SECTION_CONFIG.animals.icon}
							title={FORM_SECTION_CONFIG.animals.label}
							color={FORM_SECTION_CONFIG.animals.color}
						>
							<div class="space-y-4">
								<CheckboxField
									id="hasPets"
									name="hasPets"
									label="J'ai des animaux"
									checked={$formData.hasPets}
									onChange={(v) => ($formData.hasPets = v)}
								/>

								{#if $formData.hasPets}
									<div class="grid grid-cols-2 gap-4">
										<InputField
											id="numberOfCats"
											name="numberOfCats"
											label="Chats"
											type="number"
											size="sm"
											bind:value={$formData.numberOfCats}
											error={$errors.numberOfCats?.[0]}
										/>
										<InputField
											id="numberOfDogs"
											name="numberOfDogs"
											label="Chiens"
											type="number"
											size="sm"
											bind:value={$formData.numberOfDogs}
											error={$errors.numberOfDogs?.[0]}
										/>
									</div>

									<TextareaField
										id="otherPets"
										name="otherPets"
										label="Autres animaux"
										placeholder="Ex: lapin, hamster, perroquet..."
										bind:value={$formData.otherPets}
										error={$errors.otherPets?.[0]}
									/>
								{/if}
							</div>
						</SectionCard>

						<SectionCard
							icon={FORM_SECTION_CONFIG.foyer.icon}
							title={FORM_SECTION_CONFIG.foyer.label}
							color={FORM_SECTION_CONFIG.foyer.color}
						>
							<InputField
								id="numberOfChildren"
								name="numberOfChildren"
								label="Enfants"
								type="number"
								required
								size="sm"
								bind:value={$formData.numberOfChildren}
								error={$errors.numberOfChildren?.[0]}
							/>
						</SectionCard>

						<p class="text-muted-foreground text-xs">
							<span class="text-destructive">*</span> Champs obligatoires
						</p>
					</div>

					<!-- NAVIGATION -->
					<div class="flex justify-between pt-4">
						{#if step > 1}
							<button type="button" onclick={prevStep} class="flex items-center gap-2">
								<ChevronLeft class="h-4 w-4" />
								Retour
							</button>
						{/if}

						{#if step < totalSteps}
							<button type="button" onclick={nextStep} class="flex items-center gap-2">
								Suivant
								<ChevronRight class="h-4 w-4" />
							</button>
						{:else}
							<Form.Button type="submit">Envoyer</Form.Button>
						{/if}
					</div>
				</form>
			</Card.Content>

			<!-- PROGRESS -->
			<Card.Footer class="flex flex-col gap-2">
				<div class="bg-muted h-2 w-full rounded-full">
					<div
						class="bg-primary h-2 rounded-full transition-all duration-300"
						style={`width: ${progress}%`}
					></div>
				</div>

				<p class="text-muted-foreground text-center text-xs">
					Étape {step} / {totalSteps}
				</p>
			</Card.Footer>
		</Card.Root>
	</div>
</main>
