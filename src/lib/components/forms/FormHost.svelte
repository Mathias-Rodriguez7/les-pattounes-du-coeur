<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label';

	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	import { toast } from 'svelte-sonner';

	import {
		hostFormSchema,
		hostStep1Schema,
		hostStep2Schema,
		hostStep3Schema,
		hostStep4Schema
	} from '$lib/schema/hostForm';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';

	import { zod4Client } from 'sveltekit-superforms/adapters';

	import { get } from 'svelte/store';

	let { data } = $props<{
		data: SuperValidated<Infer<typeof hostFormSchema>>;
	}>();

	// FORM
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

	const { form: formData, enhance } = form;

	// STEP
	let step = $state(1);

	const totalSteps = 4;

	const progress = $derived(((step - 1) / (totalSteps - 1)) * 100);

	function validateCurrentStep() {
		let schema =
			step === 1
				? hostStep1Schema
				: step === 2
					? hostStep2Schema
					: step === 3
						? hostStep3Schema
						: hostStep4Schema;

		return schema.safeParse(get(formData)).success;
	}

	function nextStep() {
		if (!validateCurrentStep()) return;

		if (step < totalSteps) {
			step++;
		}
	}

	function prevStep() {
		if (step > 1) {
			step--;
		}
	}

	// DATA
	const hostTypes = [
		{
			value: 'CLASSIC',
			label: 'Famille d’accueil classique'
		},
		{
			value: 'RELAY',
			label: 'Famille relais'
		}
	];

	const spaces = [
		{
			value: 'SMALL',
			label: 'Petit espace'
		},
		{
			value: 'MEDIUM',
			label: 'Espace moyen'
		},
		{
			value: 'LARGE',
			label: 'Grand espace'
		}
	];

	const healLevels = [
		{
			value: 'NO',
			label: 'Aucun soin'
		},
		{
			value: 'LIGHT',
			label: 'Soins légers'
		},
		{
			value: 'HEAVY',
			label: 'Soins importants'
		},
		{
			value: 'HEAVY_STING',
			label: 'Soins très lourds'
		}
	];

	const socializeLevels = [
		{
			value: 'NO',
			label: 'Non'
		},
		{
			value: 'FEARFUL',
			label: 'Chats craintifs'
		},
		{
			value: 'WITHOUT_EX',
			label: 'Sans expérience'
		},
		{
			value: 'EXPERIENCED',
			label: 'Expérimenté'
		}
	];

	const babyFeedingLevels = [
		{
			value: 'NO',
			label: 'Non'
		},
		{
			value: 'WITHOUT_EX',
			label: 'Sans expérience'
		},
		{
			value: 'EXPERIENCED',
			label: 'Expérimenté'
		},
		{
			value: 'RELAY',
			label: 'Relais biberonnage'
		}
	];

	// STYLE
	const fieldClass =
		'border bg-background px-4 text-left shadow-sm transition hover:bg-foreground/10';

	const textareaClass = 'hover:bg-foreground/10 min-h-28 w-full rounded-2xl px-4 py-3';

	const selectClass =
		'border bg-background px-4 text-left shadow-sm transition hover:bg-foreground/10';
</script>

<form method="POST" action="?/host" use:enhance class="space-y-8">
	<!-- STEP 1 -->
	<div class:hidden={step !== 1} class="space-y-6">
		<h2 class="text-xl font-semibold">Informations personnelles</h2>

		<div class="grid grid-cols-2 gap-4">
			<Form.Field {form} name="firstName">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Prénom</Form.Label>

						<Input {...props} bind:value={$formData.firstName} class={fieldClass} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="lastName">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Nom</Form.Label>

						<Input {...props} bind:value={$formData.lastName} class={fieldClass} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>

					<Input type="email" {...props} bind:value={$formData.email} class={fieldClass} />
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>

		<div class="grid grid-cols-2 gap-4">
			<Form.Field {form} name="phone">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Téléphone</Form.Label>

						<Input {...props} bind:value={$formData.phone} class={fieldClass} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="age">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Âge</Form.Label>

						<Input type="number" {...props} bind:value={$formData.age} class={fieldClass} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Field {form} name="address">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Adresse</Form.Label>

					<Input {...props} bind:value={$formData.address} class={fieldClass} />
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="job">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Profession</Form.Label>

					<Input {...props} bind:value={$formData.job} class={fieldClass} />
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- STEP 2 -->
	<div class:hidden={step !== 2} class="space-y-6">
		<h2 class="text-xl font-semibold">Accueil & capacités</h2>

		<Form.Field {form} name="space">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Espace disponible</Form.Label>

					<Select.Root type="single" bind:value={$formData.space}>
						<Select.Trigger {...props} class={selectClass}>
							{$formData.space ? spaces.find((s) => s.value === $formData.space)?.label : 'Choisir'}
						</Select.Trigger>

						<Select.Content>
							<Select.Group>
								{#each spaces as space (space.value)}
									<Select.Item value={space.value}>
										{space.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="homeDescription">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Description du foyer</Form.Label>

					<Textarea
						placeholder="Décrivez votre logement..."
						{...props}
						bind:value={$formData.homeDescription}
						class={textareaClass}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- OUTSIDE BOOLEAN -->
		<Form.Field {form} name="outside">
			<Form.Control>
				{#snippet children({ props })}
					<Label
						class="hover:bg-secondary flex items-center justify-between rounded-4xl border p-4"
					>
						<Form.Label>Accès extérieur</Form.Label>

						<Checkbox
							{...props}
							checked={$formData.outside}
							onCheckedChange={(v) => ($formData.outside = Boolean(v))}
						/>
					</Label>
				{/snippet}
			</Form.Control>
		</Form.Field>

		<!-- CONDITIONNEL -->
		{#if $formData.outside}
			<Form.Field {form} name="outsideDescription">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description extérieur</Form.Label>

						<Textarea
							placeholder="Jardin, balcon sécurisé..."
							{...props}
							bind:value={$formData.outsideDescription}
							class={textareaClass}
						/>
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		{/if}

		<Form.Field {form} name="hasAnimalsAtHome">
			<Form.Control>
				{#snippet children({ props })}
					<Label
						class="hover:bg-secondary flex items-center justify-between rounded-4xl border p-4"
					>
						<Form.Label>🐾 Des animaux vivent déjà chez vous ?</Form.Label>

						<Checkbox
							{...props}
							checked={$formData.hasAnimalsAtHome}
							onCheckedChange={(v) => {
								$formData.hasAnimalsAtHome = Boolean(v);

								// reset propre
								if (!v) {
									$formData.numberOfCatsAtHome = undefined;
									$formData.numberOfDogsAtHome = undefined;
									$formData.otherAnimalsAtHome = undefined;
								}
							}}
						/>
					</Label>
				{/snippet}
			</Form.Control>
		</Form.Field>

		{#if $formData.hasAnimalsAtHome}
			<div class="grid grid-cols-2 gap-4">
				<Form.Field {form} name="numberOfCatsAtHome">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>🐱 Chats</Form.Label>
							<Input type="number" min="0" {...props} bind:value={$formData.numberOfCatsAtHome} />
						{/snippet}
					</Form.Control>
				</Form.Field>

				<Form.Field {form} name="numberOfDogsAtHome">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>🐶 Chiens</Form.Label>
							<Input type="number" min="0" {...props} bind:value={$formData.numberOfDogsAtHome} />
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>

			<Form.Field {form} name="otherAnimalsAtHome">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>🐾 Autres animaux</Form.Label>

						<Textarea
							placeholder="Lapins, oiseaux, etc..."
							{...props}
							bind:value={$formData.otherAnimalsAtHome}
						/>
					{/snippet}
				</Form.Control>
			</Form.Field>
		{/if}
	</div>

	<!-- STEP 3 -->
	<div class:hidden={step !== 3} class="space-y-6">
		<h2 class="text-xl font-semibold">Expérience & capacités</h2>

		<!-- TYPE -->
		<Form.Field {form} name="type">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Type d’accueil</Form.Label>

					<Select.Root type="single" bind:value={$formData.type}>
						<Select.Trigger {...props} class={selectClass}>
							{$formData.type
								? hostTypes.find((t) => t.value === $formData.type)?.label
								: 'Choisir un type'}
						</Select.Trigger>

						<Select.Content>
							<Select.Group>
								{#each hostTypes as type (type.value)}
									<Select.Item value={type.value}>
										{type.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- HEAL -->
		<Form.Field {form} name="heal">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Niveau de soins acceptés</Form.Label>

					<Select.Root type="single" bind:value={$formData.heal}>
						<Select.Trigger {...props} class={selectClass}>
							{$formData.heal
								? healLevels.find((h) => h.value === $formData.heal)?.label
								: 'Choisir'}
						</Select.Trigger>

						<Select.Content>
							<Select.Group>
								{#each healLevels as heal (heal.value)}
									<Select.Item value={heal.value}>
										{heal.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- SOCIALIZE -->
		<Form.Field {form} name="socialize">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Socialisation des chats</Form.Label>

					<Select.Root type="single" bind:value={$formData.socialize}>
						<Select.Trigger {...props} class={selectClass}>
							{$formData.socialize
								? socializeLevels.find((s) => s.value === $formData.socialize)?.label
								: 'Choisir'}
						</Select.Trigger>

						<Select.Content>
							<Select.Group>
								{#each socializeLevels as s (s.value)}
									<Select.Item value={s.value}>
										{s.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- BABY FEEDING -->
		<Form.Field {form} name="babyFeeding">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Biberonnage</Form.Label>

					<Select.Root type="single" bind:value={$formData.babyFeeding}>
						<Select.Trigger {...props} class={selectClass}>
							{$formData.babyFeeding
								? babyFeedingLevels.find((b) => b.value === $formData.babyFeeding)?.label
								: 'Choisir'}
						</Select.Trigger>

						<Select.Content>
							<Select.Group>
								{#each babyFeedingLevels as b (b.value)}
									<Select.Item value={b.value}>
										{b.label}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<!-- CAR -->
		<Form.Field {form} name="car">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex items-center justify-between rounded-xl border p-4">
						<Form.Label>Véhicule disponible</Form.Label>

						<Checkbox
							{...props}
							checked={$formData.car}
							onCheckedChange={(v) => ($formData.car = Boolean(v))}
						/>
					</div>
				{/snippet}
			</Form.Control>
		</Form.Field>
	</div>

	<!-- STEP 4 -->
	<div class:hidden={step !== 4} class="space-y-8">
		<div class="space-y-2">
			<h2 class="text-xl font-semibold">Engagement & disponibilité</h2>

			<p class="text-muted-foreground text-sm">
				Ces informations nous permettent de trouver les chats les plus adaptés à votre situation.
			</p>
		</div>

		<!-- TYPES DE CHATS -->
		<div class="space-y-4">
			<div class="space-y-1">
				<h3 class="font-medium">Types de chats acceptés</h3>

				<p class="text-muted-foreground text-sm">Quels profils pouvez-vous accueillir ?</p>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				<!-- CHATS ADULTES -->
				<Form.Field {form} name="canHostAdultCats">
					<Form.Control>
						{#snippet children({ props })}
							<Label
								class={`flex cursor-pointer items-start gap-3 rounded-3xl border p-4 transition ${
									$formData.canHostAdultCats ? 'border-primary bg-primary/5' : 'hover:bg-secondary'
								}`}
							>
								<Checkbox
									{...props}
									checked={$formData.canHostAdultCats}
									onCheckedChange={(v) => ($formData.canHostAdultCats = Boolean(v))}
								/>

								<div class="space-y-1">
									<p class="text-sm font-medium">🐱 Chats adultes</p>

									<p class="text-muted-foreground text-xs">Accueil de chats adultes seuls.</p>
								</div>
							</Label>
						{/snippet}
					</Form.Control>
				</Form.Field>

				<!-- CHATONS -->
				<Form.Field {form} name="canHostKittens">
					<Form.Control>
						{#snippet children({ props })}
							<Label
								class={`flex cursor-pointer items-start gap-3 rounded-3xl border p-4 transition ${
									$formData.canHostKittens ? 'border-primary bg-primary/5' : 'hover:bg-secondary'
								}`}
							>
								<Checkbox
									{...props}
									checked={$formData.canHostKittens}
									onCheckedChange={(v) => ($formData.canHostKittens = Boolean(v))}
								/>

								<div class="space-y-1">
									<p class="text-sm font-medium">🐾 Chatons</p>

									<p class="text-muted-foreground text-xs">Accueil de plusieurs chatons.</p>
								</div>
							</Label>
						{/snippet}
					</Form.Control>
				</Form.Field>

				<!-- MAMAN + CHATONS -->
				<Form.Field {form} name="canHostMotherAndKittens">
					<Form.Control>
						{#snippet children({ props })}
							<Label
								class={`flex cursor-pointer items-start gap-3 rounded-3xl border p-4 transition ${
									$formData.canHostMotherAndKittens
										? 'border-primary bg-primary/5'
										: 'hover:bg-secondary'
								}`}
							>
								<Checkbox
									{...props}
									checked={$formData.canHostMotherAndKittens}
									onCheckedChange={(v) => ($formData.canHostMotherAndKittens = Boolean(v))}
								/>

								<div class="space-y-1">
									<p class="text-sm font-medium">👩‍🍼 Maman + petits</p>

									<p class="text-muted-foreground text-xs">Accueil d’une mère et sa portée.</p>
								</div>
							</Label>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
		</div>

		<!-- PRÉSENCE -->
		<Form.Field {form} name="presenceWeek">
			<Form.Control>
				{#snippet children({ props })}
					<div class="space-y-2">
						<Form.Label>Présence dans le logement</Form.Label>

						<Select.Root type="single" bind:value={$formData.presenceWeek}>
							<Select.Trigger {...props} class={selectClass}>
								{#if $formData.presenceWeek}
									{#if $formData.presenceWeek === 'FULL_TIME_HOME'}
										Toujours à la maison
									{:else if $formData.presenceWeek === 'HOME_HALF_DAY'}
										Présent une bonne partie de la journée
									{:else if $formData.presenceWeek === 'EVENINGS_ONLY'}
										Présent surtout le soir
									{:else if $formData.presenceWeek === 'WEEKENDS_ONLY'}
										Disponible le week-end
									{:else}
										Présence occasionnelle
									{/if}
								{:else}
									Sélectionner une présence
								{/if}
							</Select.Trigger>

							<Select.Content>
								<Select.Group>
									<Select.Item value="FULL_TIME_HOME">Toujours à la maison</Select.Item>

									<Select.Item value="HOME_HALF_DAY">
										Présent une bonne partie de la journée
									</Select.Item>

									<Select.Item value="EVENINGS_ONLY">Présent surtout le soir</Select.Item>

									<Select.Item value="WEEKENDS_ONLY">Disponible le week-end</Select.Item>

									<Select.Item value="OCCASIONAL">Présence occasionnelle</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>

		<!-- DURÉE -->
		<Form.Field {form} name="availabilityDuration">
			<Form.Control>
				{#snippet children({ props })}
					<div class="space-y-2">
						<Form.Label>Durée d’engagement prévue</Form.Label>

						<Select.Root type="single" bind:value={$formData.availabilityDuration}>
							<Select.Trigger {...props} class={selectClass}>
								{#if $formData.availabilityDuration}
									{#if $formData.availabilityDuration === 'LESS_THAN_1_MONTH'}
										Moins d’1 mois
									{:else if $formData.availabilityDuration === '1_TO_3_MONTHS'}
										1 à 3 mois
									{:else if $formData.availabilityDuration === '3_TO_6_MONTHS'}
										3 à 6 mois
									{:else if $formData.availabilityDuration === 'MORE_THAN_6_MONTHS'}
										Plus de 6 mois
									{:else}
										Long terme
									{/if}
								{:else}
									Sélectionner une durée
								{/if}
							</Select.Trigger>

							<Select.Content>
								<Select.Group>
									<Select.Item value="LESS_THAN_1_MONTH">Moins d’1 mois</Select.Item>

									<Select.Item value="1_TO_3_MONTHS">1 à 3 mois</Select.Item>

									<Select.Item value="3_TO_6_MONTHS">3 à 6 mois</Select.Item>

									<Select.Item value="MORE_THAN_6_MONTHS">Plus de 6 mois</Select.Item>

									<Select.Item value="LONG_TERM">Long terme</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>

		<!-- MOTIVATION -->
		<Form.Field {form} name="motivation">
			<Form.Control>
				{#snippet children({ props })}
					<div class="space-y-2">
						<Form.Label>Motivation</Form.Label>

						<Textarea
							placeholder="Pourquoi souhaitez-vous devenir famille d’accueil ?"
							{...props}
							bind:value={$formData.motivation}
							class={textareaClass}
						/>
					</div>
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>

		<!-- MESSAGE -->
		<Form.Field {form} name="additionalMessage">
			<Form.Control>
				{#snippet children({ props })}
					<div class="space-y-2">
						<Form.Label>Informations complémentaires</Form.Label>

						<Textarea
							placeholder="Vous pouvez ajouter toute information utile..."
							{...props}
							bind:value={$formData.additionalMessage}
							class={textareaClass}
						/>
					</div>
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>
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
			<Button type="submit">Envoyer la candidature</Button>
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
