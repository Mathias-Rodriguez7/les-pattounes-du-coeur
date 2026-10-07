<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import {
		hostFormSchema,
		hostStep1Schema,
		hostStep2Schema,
		hostStep3Schema,
		hostStep4Schema
	} from '$lib/schemas/formShema/hostForm';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import CheckboxField from '$lib/components/fields/CheckboxField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';
	import DatePicker from '$lib/components/fields/DatePicker.svelte';
	import { DISTRICT_LABELS } from '$lib/utils/districts';

	let { data } = $props<{
		data: SuperValidated<Infer<typeof hostFormSchema>>;
	}>();

	let step = $state(1);
	const totalSteps = 4;
	const progress = $derived(((step - 1) / (totalSteps - 1)) * 100);

	const form = superForm(data, {
		validators: zod4Client(hostFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Candidature envoyée avec succès 🎉');
				form.reset();
				step = 1;
			}
			if (result.type === 'failure') {
				toast.error("Une erreur s'est produite ❌");
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;

	// Validation par étape + affichage des erreurs
	function validateCurrentStep(): boolean {
		const schema =
			step === 1
				? hostStep1Schema
				: step === 2
					? hostStep2Schema
					: step === 3
						? hostStep3Schema
						: hostStep4Schema;

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

	// DatePicker manipule un Date, le schéma attend 'YYYY-MM-DD'
	let birthDate = $state<Date | undefined>(undefined);
	function onBirthDateSelect(date: Date) {
		birthDate = date;
		$formData.birthDate = date.toISOString().split('T')[0] as never;
	}

	const districtOptions = $derived(
		Object.entries(DISTRICT_LABELS).map(([value, label]) => ({ value, label }))
	);

	// OPTIONS
	const hostTypes = [
		{ value: 'CLASSIC', label: "Famille d'accueil classique" },
		{ value: 'RELAY', label: 'Famille relais' }
	];

	const spaceOptions = [
		{ value: 'SMALL', label: 'Petit espace' },
		{ value: 'MEDIUM', label: 'Espace moyen' },
		{ value: 'LARGE', label: 'Grand espace' }
	];

	const healOptions = [
		{ value: 'NO', label: 'Aucun soin' },
		{ value: 'LIGHT', label: 'Soins légers' },
		{ value: 'HEAVY', label: 'Soins importants' },
		{ value: 'HEAVY_STING', label: 'Soins très lourds' }
	];

	const socializeOptions = [
		{ value: 'NO', label: 'Non' },
		{ value: 'FEARFUL', label: 'Chats craintifs' },
		{ value: 'WITHOUT_EX', label: 'Sans expérience' },
		{ value: 'EXPERIENCED', label: 'Expérimenté' }
	];

	const babyFeedingOptions = [
		{ value: 'NO', label: 'Non' },
		{ value: 'WITHOUT_EX', label: 'Sans expérience' },
		{ value: 'EXPERIENCED', label: 'Expérimenté' },
		{ value: 'RELAY', label: 'Relais biberonnage' }
	];

	const presenceOptions = [
		{ value: 'FULL_TIME_HOME', label: 'Toujours à la maison' },
		{ value: 'HOME_HALF_DAY', label: 'Présent une bonne partie de la journée' },
		{ value: 'EVENINGS_ONLY', label: 'Présent surtout le soir' },
		{ value: 'WEEKENDS_ONLY', label: 'Disponible le week-end' },
		{ value: 'OCCASIONAL', label: 'Présence occasionnelle' }
	];

	const durationOptions = [
		{ value: 'LESS_THAN_1_MONTH', label: "Moins d'1 mois" },
		{ value: '1_TO_3_MONTHS', label: '1 à 3 mois' },
		{ value: '3_TO_6_MONTHS', label: '3 à 6 mois' },
		{ value: 'MORE_THAN_6_MONTHS', label: 'Plus de 6 mois' },
		{ value: 'LONG_TERM', label: 'Long terme' }
	];
</script>

<form method="POST" action="?/host" use:enhance class="space-y-8">
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
		<h2 class="text-xl font-semibold">Accueil & capacités</h2>

		<SelectField
			id="space"
			name="space"
			label="Espace disponible"
			placeholder="Choisir"
			options={spaceOptions}
			bind:value={$formData.space}
			required
			size="sm"
		/>
		{#if $errors.space}
			<p class="-mt-4 text-xs text-red-500">{$errors.space[0]}</p>
		{/if}

		<TextareaField
			id="homeDescription"
			name="homeDescription"
			label="Description du foyer"
			placeholder="Décrivez votre logement..."
			bind:value={$formData.homeDescription}
			error={$errors.homeDescription?.[0]}
			required
		/>

		<CheckboxField
			id="outside"
			name="outside"
			label="Accès extérieur"
			checked={$formData.outside}
			onChange={(value) => {
				$formData.outside = value;
				if (!value) $formData.outsideDescription = undefined;
			}}
		/>

		{#if $formData.outside}
			<TextareaField
				id="outsideDescription"
				name="outsideDescription"
				label="Description extérieur"
				placeholder="Jardin, balcon sécurisé..."
				bind:value={$formData.outsideDescription}
				error={$errors.outsideDescription?.[0]}
				required
			/>
		{/if}

		<CheckboxField
			id="hasAnimalsAtHome"
			name="hasAnimalsAtHome"
			label="Des animaux vivent déjà chez vous ?"
			checked={$formData.hasAnimalsAtHome}
			onChange={(value) => {
				$formData.hasAnimalsAtHome = value;
				if (!value) {
					$formData.numberOfCatsAtHome = undefined;
					$formData.numberOfDogsAtHome = undefined;
					$formData.otherAnimalsAtHome = undefined;
				}
			}}
		/>

		{#if $formData.hasAnimalsAtHome}
			<div class="grid grid-cols-2 gap-4">
				<InputField
					id="numberOfCatsAtHome"
					name="numberOfCatsAtHome"
					label="Chats"
					type="number"
					min="0"
					bind:value={$formData.numberOfCatsAtHome}
					size="sm"
				/>
				<InputField
					id="numberOfDogsAtHome"
					name="numberOfDogsAtHome"
					label="Chiens"
					type="number"
					min="0"
					bind:value={$formData.numberOfDogsAtHome}
					size="sm"
				/>
			</div>

			<TextareaField
				id="otherAnimalsAtHome"
				name="otherAnimalsAtHome"
				label="Autres animaux"
				placeholder="Lapins, oiseaux, etc..."
				bind:value={$formData.otherAnimalsAtHome}
			/>
		{/if}
	</div>

	<!-- STEP 3 -->
	<div class:hidden={step !== 3} class="space-y-6">
		<h2 class="text-xl font-semibold">Expérience & capacités</h2>

		<SelectField
			id="type"
			name="type"
			label="Type d'accueil"
			placeholder="Choisir un type"
			options={hostTypes}
			bind:value={$formData.type}
			required
			size="sm"
		/>
		{#if $errors.type}
			<p class="-mt-4 text-xs text-red-500">{$errors.type[0]}</p>
		{/if}

		<SelectField
			id="heal"
			name="heal"
			label="Niveau de soins acceptés"
			placeholder="Choisir"
			options={healOptions}
			bind:value={$formData.heal}
			required
			size="sm"
		/>
		{#if $errors.heal}
			<p class="-mt-4 text-xs text-red-500">{$errors.heal[0]}</p>
		{/if}

		<SelectField
			id="socialize"
			name="socialize"
			label="Socialisation des chats"
			placeholder="Choisir"
			options={socializeOptions}
			bind:value={$formData.socialize}
			required
			size="sm"
		/>
		{#if $errors.socialize}
			<p class="-mt-4 text-xs text-red-500">{$errors.socialize[0]}</p>
		{/if}

		<SelectField
			id="babyFeeding"
			name="babyFeeding"
			label="Biberonnage"
			placeholder="Choisir"
			options={babyFeedingOptions}
			bind:value={$formData.babyFeeding}
			required
			size="sm"
		/>
		{#if $errors.babyFeeding}
			<p class="-mt-4 text-xs text-red-500">{$errors.babyFeeding[0]}</p>
		{/if}

		<CheckboxField
			id="car"
			name="car"
			label="Véhicule disponible"
			checked={$formData.car}
			onChange={(value) => ($formData.car = value)}
		/>
	</div>

	<!-- STEP 4 -->
	<div class:hidden={step !== 4} class="space-y-8">
		<div class="space-y-2">
			<h2 class="text-xl font-semibold">Engagement & disponibilité</h2>
			<p class="text-muted-foreground text-sm">
				Ces informations nous permettent de trouver les chats les plus adaptés à votre situation.
			</p>
		</div>

		<div class="space-y-4">
			<div class="space-y-1">
				<h3 class="font-medium">Types de chats acceptés</h3>
				<p class="text-muted-foreground text-sm">Quels profils pouvez-vous accueillir ?</p>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<CheckboxField
					id="canHostAdultCats"
					name="canHostAdultCats"
					label="🐱 Chats adultes (accueil de chats adultes seuls)"
					checked={$formData.canHostAdultCats}
					onChange={(value) => ($formData.canHostAdultCats = value)}
				/>

				<CheckboxField
					id="canHostKittens"
					name="canHostKittens"
					label="🐾 Chatons (accueil de plusieurs chatons)"
					checked={$formData.canHostKittens}
					onChange={(value) => ($formData.canHostKittens = value)}
				/>

				<CheckboxField
					id="canHostMotherAndKittens"
					name="canHostMotherAndKittens"
					label="👩‍🍼 Maman + petits (accueil d'une mère et sa portée)"
					checked={$formData.canHostMotherAndKittens}
					onChange={(value) => ($formData.canHostMotherAndKittens = value)}
				/>
			</div>
		</div>

		<SelectField
			id="presenceWeek"
			name="presenceWeek"
			label="Présence dans le logement"
			placeholder="Sélectionner une présence"
			options={presenceOptions}
			bind:value={$formData.presenceWeek}
			required
			size="sm"
		/>
		{#if $errors.presenceWeek}
			<p class="-mt-4 text-xs text-red-500">{$errors.presenceWeek[0]}</p>
		{/if}

		<SelectField
			id="availabilityDuration"
			name="availabilityDuration"
			label="Durée d'engagement prévue"
			placeholder="Sélectionner une durée"
			options={durationOptions}
			bind:value={$formData.availabilityDuration}
			required
			size="sm"
		/>
		{#if $errors.availabilityDuration}
			<p class="-mt-4 text-xs text-red-500">{$errors.availabilityDuration[0]}</p>
		{/if}

		<TextareaField
			id="motivation"
			name="motivation"
			label="Motivation"
			placeholder="Pourquoi souhaitez-vous devenir famille d'accueil ?"
			bind:value={$formData.motivation}
			error={$errors.motivation?.[0]}
			required
		/>

		<TextareaField
			id="additionalMessage"
			name="additionalMessage"
			label="Informations complémentaires"
			placeholder="Vous pouvez ajouter toute information utile..."
			bind:value={$formData.additionalMessage}
			error={$errors.additionalMessage?.[0]}
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
