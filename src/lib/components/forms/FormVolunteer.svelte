<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	import { toast } from 'svelte-sonner';

	import {
		volunteerFormSchema,
		volunteerStep1Schema,
		volunteerStep2Schema,
		volunteerStep3Schema,
		volunteerStep4Schema
	} from '$lib/schema/volunteerForm';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';

	import { zod4Client } from 'sveltekit-superforms/adapters';

	import { get } from 'svelte/store';

	let { data } = $props<{
		data: SuperValidated<Infer<typeof volunteerFormSchema>>;
	}>();

	// FORM
	const form = superForm(data, {
		validators: zod4Client(volunteerFormSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Candidature envoyée 🎉');
				form.reset();
				step = 1;
			}
		}
	});

	const { form: formData, enhance } = form;

	// STEP
	let step = $state(1);

	const totalSteps = 4;

	const progress = $derived(((step - 1) / (totalSteps - 1)) * 100);

	function validateCurrentStep() {
		const schema =
			step === 1
				? volunteerStep1Schema
				: step === 2
					? volunteerStep2Schema
					: step === 3
						? volunteerStep3Schema
						: volunteerStep4Schema;

		const result = schema.safeParse(get(formData));

		return result.success;
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

	// STYLE
	const fieldClass =
		'border bg-background px-4 text-left shadow-sm transition hover:bg-foreground/10';

	const textareaClass = 'hover:bg-foreground/10 min-h-28 w-full rounded-2xl border px-4 py-3';

	const selectClass =
		'border bg-background px-4 text-left shadow-sm transition hover:bg-foreground/10';
</script>

<form method="POST" action="?/volunteer" use:enhance class="space-y-8">
	<!-- STEP 1 -->
	<div class:hidden={step !== 1} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Informations personnelles</h2>
			<p class="text-muted-foreground text-sm">Parlez-nous un peu de vous.</p>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<Form.Field {form} name="firstName">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Prénom <span class="text-destructive">*</span></Form.Label>
						<Input {...props} bind:value={$formData.firstName} class={fieldClass} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="lastName">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Nom <span class="text-destructive">*</span></Form.Label>
						<Input {...props} bind:value={$formData.lastName} class={fieldClass} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email <span class="text-destructive">*</span></Form.Label>
					<Input type="email" {...props} bind:value={$formData.email} class={fieldClass} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<div class="grid grid-cols-2 gap-4">
			<Form.Field {form} name="phone">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Téléphone <span class="text-destructive">*</span></Form.Label>
						<Input {...props} bind:value={$formData.phone} class={fieldClass} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="age">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Âge <span class="text-destructive">*</span></Form.Label>
						<Input type="number" {...props} bind:value={$formData.age} class={fieldClass} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</div>

		<Form.Field {form} name="address">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Adresse <span class="text-destructive">*</span></Form.Label>
					<Input {...props} bind:value={$formData.address} class={fieldClass} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="job">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Profession <span class="text-destructive">*</span></Form.Label>
					<Input {...props} bind:value={$formData.job} class={fieldClass} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- STEP 2 -->
	<div class:hidden={step !== 2} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Expérience</h2>
			<p class="text-muted-foreground text-sm">
				Parlez-nous de votre expérience avec les chats et le bénévolat.
			</p>
		</div>

		<Form.Field {form} name="hasCatExperience">
			<Form.Control>
				{#snippet children({ props })}
					<Label
						class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
					>
						<Checkbox
							{...props}
							checked={$formData.hasCatExperience}
							onCheckedChange={(v) => ($formData.hasCatExperience = !!v)}
						/>
						<div>
							<p class="text-sm font-medium">Expérience avec les chats</p>
							<p class="text-muted-foreground text-xs">
								Avez-vous déjà vécu ou travaillé avec des chats ?
							</p>
						</div>
					</Label>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		{#if $formData.hasCatExperience}
			<Form.Field {form} name="catExperienceDescription">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label
							>Décrivez votre expérience avec les chats <span class="text-destructive">*</span
							></Form.Label
						>
						<Textarea
							placeholder="Ex : j'ai eu plusieurs chats, famille d'accueil, etc..."
							{...props}
							bind:value={$formData.catExperienceDescription}
							class={textareaClass}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		<Form.Field {form} name="hasAssociationExperience">
			<Form.Control>
				{#snippet children({ props })}
					<Label
						class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
					>
						<Checkbox
							{...props}
							checked={$formData.hasAssociationExperience}
							onCheckedChange={(v) => ($formData.hasAssociationExperience = !!v)}
						/>
						<div>
							<p class="text-sm font-medium">Expérience associative</p>
							<p class="text-muted-foreground text-xs">
								Avez-vous déjà travaillé dans une association ?
							</p>
						</div>
					</Label>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		{#if $formData.hasAssociationExperience}
			<Form.Field {form} name="associationExperienceDescription">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label
							>Décrivez votre expérience associative <span class="text-destructive">*</span
							></Form.Label
						>
						<Textarea
							placeholder="Ex : bénévolat, refuge, organisation..."
							{...props}
							bind:value={$formData.associationExperienceDescription}
							class={textareaClass}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		<Form.Field {form} name="hasMedicalCareExperience">
			<Form.Control>
				{#snippet children({ props })}
					<Label
						class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
					>
						<Checkbox
							{...props}
							checked={$formData.hasMedicalCareExperience}
							onCheckedChange={(v) => ($formData.hasMedicalCareExperience = !!v)}
						/>
						<div>
							<p class="text-sm font-medium">Soins médicaux</p>
							<p class="text-muted-foreground text-xs">
								Avez-vous déjà donné des soins à des animaux ?
							</p>
						</div>
					</Label>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		{#if $formData.hasMedicalCareExperience}
			<Form.Field {form} name="medicalCareDescription">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Détail des soins <span class="text-destructive">*</span></Form.Label>
						<Textarea
							placeholder="Ex : médicaments, blessures, injections..."
							{...props}
							bind:value={$formData.medicalCareDescription}
							class={textareaClass}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}

		<Form.Field {form} name="hasTransportExperience">
			<Form.Control>
				{#snippet children({ props })}
					<Label
						class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
					>
						<Checkbox
							{...props}
							checked={$formData.hasTransportExperience}
							onCheckedChange={(v) => ($formData.hasTransportExperience = !!v)}
						/>
						<div>
							<p class="text-sm font-medium">Transport d'animaux</p>
							<p class="text-muted-foreground text-xs">Avez-vous déjà transporté des animaux ?</p>
						</div>
					</Label>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- STEP 3 -->
	<div class:hidden={step !== 3} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Disponibilité</h2>
			<p class="text-muted-foreground text-sm">
				Dites-nous quand vous êtes disponible pour aider l'association.
			</p>
		</div>

		<Form.Field {form} name="availability">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Disponibilité générale <span class="text-destructive">*</span></Form.Label>
					<Select.Root type="single" bind:value={$formData.availability}>
						<Select.Trigger {...props} class={selectClass}>
							{availabilityOptions.find((o) => o.value === $formData.availability)?.label ??
								'Choisir'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each availabilityOptions as option (option.value)}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="availabilityDuration">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Durée d'engagement <span class="text-destructive">*</span></Form.Label>
					<Select.Root type="single" bind:value={$formData.availabilityDuration}>
						<Select.Trigger {...props} class={selectClass}>
							{availabilityDurationOptions.find((o) => o.value === $formData.availabilityDuration)
								?.label ?? 'Choisir'}
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each availabilityDurationOptions as option (option.value)}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<div class="space-y-3">
			<h3 class="text-sm font-medium">Quand pouvez-vous aider ?</h3>

			<Form.Field {form} name="canHelpWeekdays">
				<Form.Control>
					{#snippet children({ props })}
						<Label
							class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
						>
							<Checkbox
								{...props}
								checked={$formData.canHelpWeekdays}
								onCheckedChange={(v) => ($formData.canHelpWeekdays = !!v)}
							/>
							<div>
								<p class="text-sm font-medium">En semaine</p>
								<p class="text-muted-foreground text-xs">Lundi à vendredi</p>
							</div>
						</Label>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Form.Field {form} name="canHelpWeekends">
				<Form.Control>
					{#snippet children({ props })}
						<Label
							class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
						>
							<Checkbox
								{...props}
								checked={$formData.canHelpWeekends}
								onCheckedChange={(v) => ($formData.canHelpWeekends = !!v)}
							/>
							<div>
								<p class="text-sm font-medium">Week-end</p>
								<p class="text-muted-foreground text-xs">Samedi et dimanche</p>
							</div>
						</Label>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Form.Field {form} name="canHelpEmergencies">
				<Form.Control>
					{#snippet children({ props })}
						<Label
							class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
						>
							<Checkbox
								{...props}
								checked={$formData.canHelpEmergencies}
								onCheckedChange={(v) => ($formData.canHelpEmergencies = !!v)}
							/>
							<div>
								<p class="text-sm font-medium">Urgences</p>
								<p class="text-muted-foreground text-xs">Interventions ponctuelles rapides</p>
							</div>
						</Label>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>

		<Form.Field {form} name="car">
			<Form.Control>
				{#snippet children({ props })}
					<Label
						class="hover:bg-secondary flex cursor-pointer items-center gap-3 rounded-4xl border p-4 transition"
					>
						<Checkbox
							{...props}
							checked={$formData.car}
							onCheckedChange={(v) => ($formData.car = !!v)}
						/>
						<div>
							<p class="text-sm font-medium">Véhicule disponible</p>
							<p class="text-muted-foreground text-xs">Pour transports ou urgences vétérinaires</p>
						</div>
					</Label>
				{/snippet}
			</Form.Control>
		</Form.Field>
	</div>

	<!-- STEP 4 -->
	<div class:hidden={step !== 4} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Motivation</h2>
			<p class="text-muted-foreground text-sm">
				Dites-nous pourquoi vous souhaitez rejoindre l'association.
			</p>
		</div>

		<Form.Field {form} name="motivation">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Votre motivation <span class="text-destructive">*</span></Form.Label>
					<Textarea
						placeholder="Expliquez pourquoi vous voulez devenir bénévole..."
						{...props}
						bind:value={$formData.motivation}
						class={textareaClass}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="skills">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Compétences</Form.Label>
					<Textarea
						placeholder="Ex: expérience animale, association, organisation..."
						{...props}
						bind:value={$formData.skills}
						class={textareaClass}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="additionalInformation">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Informations complémentaires</Form.Label>
					<Textarea
						placeholder="Autres informations utiles..."
						{...props}
						bind:value={$formData.additionalInformation}
						class={textareaClass}
					/>
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
