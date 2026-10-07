<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { ChevronRight, ChevronLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { resolve } from '$app/paths';
	import { fade, fly } from 'svelte/transition';
	import { get } from 'svelte/store';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import {
		adoptionFormSchema,
		step1Schema,
		step2Schema,
		step3Schema
	} from '$lib/schemas/formShema/adoptionForm';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';
	import CheckboxField from '$lib/components/fields/CheckboxField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';
	import SectionCard from '$lib/components/cards/SectionCard.svelte';
	import SaveCancelButtons from '$lib/components/buttons/SaveCancelButtons.svelte';
	import { FORM_SECTION_CONFIG } from '$lib/constants/form';

	let { data }: { data: { form: SuperValidated<Infer<typeof adoptionFormSchema>> } } = $props();

	let step = $state(1);
	const totalSteps = 3;
	const progress = $derived(((step - 1) / (totalSteps - 1)) * 100);

	const form = superForm(data.form, {
		validators: zod4Client(adoptionFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Demande envoyée avec succès 🎉');
				birthDate = undefined;
				form.reset();
				step = 1;
			}
			if (result.type === 'failure') {
				toast.error("Une erreur s'est produite ❌");
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;

	// DatePicker manipule un Date, le schéma attend 'YYYY-MM-DD'
	let birthDate = $state<Date | undefined>(undefined);
	function onBirthDateSelect(date: Date) {
		birthDate = date;
		$formData.birthDate = date.toISOString().split('T')[0] as never;
	}

	const districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([value, label]) => ({ value, label }))
	);

	// Validation par étape + affichage des erreurs de l'étape
	function validateCurrentStep(): boolean {
		const schema = step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema;
		const result = schema.safeParse(get(formData));
		if (result.success) return true;

		const flat = result.error.flatten().fieldErrors as Record<string, string[]>;
		errors.update(($e) => ({ ...$e, ...flat }));
		toast.error('Veuillez corriger les erreurs du formulaire');
		return false;
	}

	function nextStep() {
		if (!validateCurrentStep()) return;
		if (step < totalSteps) step++;
	}

	function prevStep() {
		if (step > 1) step--;
	}

	const catAge = [
		{ value: 'free', label: 'Sans préférence' },
		{ value: 'kitten', label: 'Chaton' },
		{ value: 'adult', label: 'Adulte' },
		{ value: 'senior', label: 'Senior' }
	];

	const catSex = [
		{ value: 'free', label: 'Sans préférence' },
		{ value: 'male', label: 'Mâle' },
		{ value: 'female', label: 'Femelle' }
	];

	const furLength = [
		{ value: 'free', label: 'Sans préférence' },
		{ value: 'short', label: 'Courts' },
		{ value: 'medium', label: 'Moyen' },
		{ value: 'long', label: 'Longs' }
	];
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="p-8">
		<Card.Root class="mx-auto w-full max-w-2xl">
			<Card.Header class="gap-4 text-center">
				<Card.Title>Trouvez votre futur compagnon</Card.Title>
				<Card.Description class="space-y-3 text-left leading-relaxed">
					<p>
						Vous souhaitez adopter un minou, mais vous ne savez plus où donner de la tête avec tous
						ces chats à l'adoption ?
					</p>
					<p>
						Nous pouvons vous aider à trouver un compagnon qui correspond à votre profil et vos
						envies.
					</p>
					<p>
						En remplissant ce formulaire, nous vous proposerons des chats adaptés à votre situation.
					</p>
					<div class="pt-2">
						<a
							href={resolve('/adoptions/chat')}
							class="text-primary hover:text-primary/80 inline-flex items-center font-medium underline underline-offset-4 transition"
						>
							<ChevronRight />
							Je préfère voir les chats disponibles
						</a>
					</div>
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

					<!-- 🐱 STEP 2 : CRITÈRES -->
					<div class:hidden={step !== 2} class="space-y-4">
						<SectionCard
							icon={FORM_SECTION_CONFIG.cat.icon}
							title={FORM_SECTION_CONFIG.cat.label}
							color={FORM_SECTION_CONFIG.cat.color}
						>
							<div class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<SelectField
										id="catAge"
										name="catAge"
										label="Âge du chat"
										required
										size="sm"
										options={catAge}
										bind:value={$formData.catAge}
									/>
									<SelectField
										id="catSex"
										name="catSex"
										label="Sexe"
										required
										size="sm"
										options={catSex}
										bind:value={$formData.catSex}
									/>
								</div>

								<SelectField
									id="furLength"
									name="furLength"
									label="Longueur du poil"
									required
									size="sm"
									options={furLength}
									bind:value={$formData.furLength}
								/>

								<InputField
									id="color"
									name="color"
									label="Couleur"
									size="sm"
									bind:value={$formData.color}
									error={$errors.color?.[0]}
								/>

								<TextareaField
									id="temperament"
									name="temperament"
									label="Caractère"
									placeholder="Ex: calme, câlin, joueur, pas craintif..."
									bind:value={$formData.temperament}
									error={$errors.temperament?.[0]}
								/>
							</div>
						</SectionCard>

						<p class="text-muted-foreground text-xs">
							<span class="text-destructive">*</span> Champs obligatoires
						</p>
					</div>

					<!-- 🏠 STEP 3 : FOYER -->
					<div class:hidden={step !== 3} class="space-y-4">
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
						{:else}
							<span></span>
						{/if}

						{#if step < totalSteps}
							<button type="button" onclick={nextStep} class="flex items-center gap-2">
								Suivant
								<ChevronRight class="h-4 w-4" />
							</button>
						{:else}
							<SaveCancelButtons isSaving={$delayed} />
						{/if}
					</div>
				</form>
			</Card.Content>

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
