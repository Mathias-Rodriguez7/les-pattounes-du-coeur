<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { colabForm, colabStep1Schema, colabStep2Schema } from '$lib/schemas/formShema/colabForm';
	import InputField from '$lib/components/fields/InputField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';

	let { data } = $props<{
		data: SuperValidated<Infer<typeof colabForm>>;
	}>();

	let step = $state(1);
	const totalSteps = 2;
	const progress = $derived(((step - 1) / (totalSteps - 1)) * 100);

	const form = superForm(data, {
		validators: zod4Client(colabForm),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Demande envoyée avec succès 🤝');
				form.reset();
				step = 1;
			}
			if (result.type === 'failure') {
				toast.error("Une erreur s'est produite ❌");
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;

	function validateCurrentStep(): boolean {
		const schema = step === 1 ? colabStep1Schema : colabStep2Schema;
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

<form method="POST" action="?/colab" use:enhance class="space-y-8">
	<!-- STEP 1: INFORMATIONS -->
	<div class:hidden={step !== 1} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Informations</h2>
			<p class="text-muted-foreground text-sm">Présentez-vous avant de proposer un partenariat.</p>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<InputField
				id="firstName"
				name="firstName"
				label="Prénom"
				bind:value={$formData.firstName}
				error={$errors.firstName?.[0]}
				required
				size="sm"
			/>
			<InputField
				id="lastName"
				name="lastName"
				label="Nom"
				bind:value={$formData.lastName}
				error={$errors.lastName?.[0]}
				required
				size="sm"
			/>
		</div>

		<InputField
			id="companyName"
			name="companyName"
			label="Entreprise"
			placeholder="Optionnel"
			bind:value={$formData.companyName}
			size="sm"
		/>

		<div class="grid grid-cols-2 gap-4">
			<InputField
				id="email"
				name="email"
				type="email"
				label="Email"
				bind:value={$formData.email}
				error={$errors.email?.[0]}
				required
				size="sm"
			/>
			<InputField
				id="phone"
				name="phone"
				label="Téléphone"
				placeholder="06 12 34 56 78"
				bind:value={$formData.phone}
				error={$errors.phone?.[0]}
				required
				size="sm"
			/>
		</div>
	</div>

	<!-- STEP 2: PARTENARIAT -->
	<div class:hidden={step !== 2} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Partenariat</h2>
			<p class="text-muted-foreground text-sm">
				Expliquez votre activité et votre proposition de collaboration.
			</p>
		</div>

		<TextareaField
			id="presentation"
			name="presentation"
			label="Présentation"
			placeholder="Présentez votre activité, votre entreprise ou votre projet..."
			bind:value={$formData.presentation}
			error={$errors.presentation?.[0]}
			required
		/>

		<TextareaField
			id="partnershipProposal"
			name="partnershipProposal"
			label="Proposition de partenariat"
			placeholder="Expliquez comment vous souhaitez collaborer avec l'association..."
			bind:value={$formData.partnershipProposal}
			error={$errors.partnershipProposal?.[0]}
			required
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
				{$delayed ? 'Envoi...' : 'Envoyer la demande'}
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
