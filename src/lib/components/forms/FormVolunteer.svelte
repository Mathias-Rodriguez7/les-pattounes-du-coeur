<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import {
		volunteerFormSchema,
		volunteerStep1Schema,
		volunteerStep2Schema,
		volunteerStep3Schema,
		volunteerStep4Schema
	} from '$lib/schemas/formShema/volunteerForm';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';
	import CheckboxField from '$lib/components/fields/CheckboxField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';

	let { data } = $props<{
		data: SuperValidated<Infer<typeof volunteerFormSchema>>;
	}>();

	let step = $state(1);
	const totalSteps = 4;
	const progress = $derived(((step - 1) / (totalSteps - 1)) * 100);

	const form = superForm(data, {
		validators: zod4Client(volunteerFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Candidature envoyée 🎉');
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

	const availabilityOptions = [
		{ value: 'LOW', label: 'Quelques heures par mois' },
		{ value: 'MEDIUM', label: 'Quelques heures par semaine' },
		{ value: 'HIGH', label: 'Très disponible' }
	];

	const availabilityDurationOptions = [
		{ value: 'LESS_THAN_1_MONTH', label: "Moins d'1 mois" },
		{ value: '1_TO_3_MONTHS', label: '1 à 3 mois' },
		{ value: '3_TO_6_MONTHS', label: '3 à 6 mois' },
		{ value: 'MORE_THAN_6_MONTHS', label: 'Plus de 6 mois' },
		{ value: 'LONG_TERM', label: 'Long terme' }
	];

	// Validation par étape + affichage des erreurs
	function validateCurrentStep(): boolean {
		const schema =
			step === 1
				? volunteerStep1Schema
				: step === 2
					? volunteerStep2Schema
					: step === 3
						? volunteerStep3Schema
						: volunteerStep4Schema;

		const result = schema.safeParse(get(formData));

		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
			errors.update((current) => {
				const next = { ...current } as Record<string, string[] | undefined>;
				for (const [key, messages] of Object.entries(fieldErrors)) {
					next[key] = messages;
				}
				return next as typeof current;
			});
			toast.error('Veuillez corriger les erreurs avant de continuer');
			return false;
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

<form method="POST" action="?/volunteer" use:enhance class="space-y-8">
	<!-- STEP 1 -->
	<div class:hidden={step !== 1} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Informations personnelles</h2>
			<p class="text-muted-foreground text-sm">Parlez-nous un peu de vous.</p>
		</div>

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
	</div>
	<!-- STEP 2 -->
	<div class:hidden={step !== 2} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Expérience</h2>
			<p class="text-muted-foreground text-sm">
				Parlez-nous de votre expérience avec les chats et le bénévolat.
			</p>
		</div>

		<CheckboxField
			id="hasCatExperience"
			name="hasCatExperience"
			label="Expérience avec les chats"
			checked={$formData.hasCatExperience}
			onChange={(value) => ($formData.hasCatExperience = value)}
		/>

		{#if $formData.hasCatExperience}
			<TextareaField
				id="catExperienceDescription"
				name="catExperienceDescription"
				label="Décrivez votre expérience avec les chats"
				placeholder="Ex : j'ai eu plusieurs chats, famille d'accueil, etc..."
				bind:value={$formData.catExperienceDescription}
				error={$errors.catExperienceDescription?.[0]}
				required
			/>
		{/if}

		<CheckboxField
			id="hasAssociationExperience"
			name="hasAssociationExperience"
			label="Expérience associative"
			checked={$formData.hasAssociationExperience}
			onChange={(value) => ($formData.hasAssociationExperience = value)}
		/>

		{#if $formData.hasAssociationExperience}
			<TextareaField
				id="associationExperienceDescription"
				name="associationExperienceDescription"
				label="Décrivez votre expérience associative"
				placeholder="Ex : bénévolat, refuge, organisation..."
				bind:value={$formData.associationExperienceDescription}
				error={$errors.associationExperienceDescription?.[0]}
				required
			/>
		{/if}

		<CheckboxField
			id="hasMedicalCareExperience"
			name="hasMedicalCareExperience"
			label="Soins médicaux"
			checked={$formData.hasMedicalCareExperience}
			onChange={(value) => ($formData.hasMedicalCareExperience = value)}
		/>

		{#if $formData.hasMedicalCareExperience}
			<TextareaField
				id="medicalCareDescription"
				name="medicalCareDescription"
				label="Détail des soins"
				placeholder="Ex : médicaments, blessures, injections..."
				bind:value={$formData.medicalCareDescription}
				error={$errors.medicalCareDescription?.[0]}
				required
			/>
		{/if}

		<CheckboxField
			id="hasTransportExperience"
			name="hasTransportExperience"
			label="Transport d'animaux"
			checked={$formData.hasTransportExperience}
			onChange={(value) => ($formData.hasTransportExperience = value)}
		/>
	</div>

	<!-- STEP 3 -->
	<div class:hidden={step !== 3} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Disponibilité</h2>
			<p class="text-muted-foreground text-sm">
				Dites-nous quand vous êtes disponible pour aider l'association.
			</p>
		</div>

		<SelectField
			id="availability"
			name="availability"
			label="Disponibilité générale"
			placeholder="Choisir"
			options={availabilityOptions}
			bind:value={$formData.availability}
			required
			size="sm"
		/>
		{#if $errors.availability}
			<p class="-mt-4 text-xs text-red-500">{$errors.availability[0]}</p>
		{/if}

		<SelectField
			id="availabilityDuration"
			name="availabilityDuration"
			label="Durée d'engagement"
			placeholder="Choisir"
			options={availabilityDurationOptions}
			bind:value={$formData.availabilityDuration}
			required
			size="sm"
		/>
		{#if $errors.availabilityDuration}
			<p class="-mt-4 text-xs text-red-500">{$errors.availabilityDuration[0]}</p>
		{/if}

		<div class="space-y-3">
			<h3 class="text-sm font-medium">Quand pouvez-vous aider ?</h3>

			<CheckboxField
				id="canHelpWeekdays"
				name="canHelpWeekdays"
				label="En semaine (lundi à vendredi)"
				checked={$formData.canHelpWeekdays}
				onChange={(value) => ($formData.canHelpWeekdays = value)}
			/>
			<CheckboxField
				id="canHelpWeekends"
				name="canHelpWeekends"
				label="Week-end (samedi et dimanche)"
				checked={$formData.canHelpWeekends}
				onChange={(value) => ($formData.canHelpWeekends = value)}
			/>
			<CheckboxField
				id="canHelpEmergencies"
				name="canHelpEmergencies"
				label="Urgences (interventions ponctuelles rapides)"
				checked={$formData.canHelpEmergencies}
				onChange={(value) => ($formData.canHelpEmergencies = value)}
			/>
		</div>

		<CheckboxField
			id="car"
			name="car"
			label="Véhicule disponible (transports ou urgences vétérinaires)"
			checked={$formData.car}
			onChange={(value) => ($formData.car = value)}
		/>
	</div>

	<!-- STEP 4 -->
	<div class:hidden={step !== 4} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Motivation</h2>
			<p class="text-muted-foreground text-sm">
				Dites-nous pourquoi vous souhaitez rejoindre l'association.
			</p>
		</div>

		<TextareaField
			id="motivation"
			name="motivation"
			label="Votre motivation"
			placeholder="Expliquez pourquoi vous voulez devenir bénévole..."
			bind:value={$formData.motivation}
			error={$errors.motivation?.[0]}
			required
		/>

		<TextareaField
			id="skills"
			name="skills"
			label="Compétences"
			placeholder="Ex: expérience animale, association, organisation..."
			bind:value={$formData.skills}
			error={$errors.skills?.[0]}
		/>

		<TextareaField
			id="additionalInformation"
			name="additionalInformation"
			label="Informations complémentaires"
			placeholder="Autres informations utiles..."
			bind:value={$formData.additionalInformation}
			error={$errors.additionalInformation?.[0]}
		/>
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
			<button
				type="submit"
				disabled={$delayed}
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
			>
				{$delayed ? 'Envoi...' : 'Envoyer la candidature'}
			</button>
		{/if}
	</div>

	<!-- PROGRESS -->
	<div class="space-y-2 pt-4">
		<div class="bg-muted h-2 w-full rounded-full">
			<div
				class="bg-primary h-2 rounded-full transition-all duration-300"
				style={`width: ${progress}%`}
			></div>
		</div>
		<p class="text-muted-foreground text-center text-xs">
			Étape {step} / {totalSteps}
		</p>
	</div>
</form>
