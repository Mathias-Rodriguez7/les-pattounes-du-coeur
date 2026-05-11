<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { colabForm, colabStep1Schema, colabStep2Schema } from '$lib/schema/colabForm';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { get } from 'svelte/store';

	let { data } = $props<{
		data: SuperValidated<Infer<typeof colabForm>>;
	}>();

	//
	// FORM
	//

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

	const { form: formData, enhance } = form;

	//
	// STEP
	//

	let step = $state(1);

	const totalSteps = 2;

	const progress = $derived(((step - 1) / (totalSteps - 1)) * 100);

	function validateCurrentStep() {
		const data = get(formData);

		const schema = step === 1 ? colabStep1Schema : colabStep2Schema;

		return schema.safeParse(data).success;
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

	//
	// STYLE
	//

	const fieldClass =
		'border bg-background px-4 text-left shadow-sm transition hover:bg-foreground/10';

	const textareaClass = 'hover:bg-foreground/10 min-h-32 w-full rounded-2xl border px-4 py-3';
</script>

<form method="POST" action="?/colab" use:enhance class="space-y-8">
	<!-- STEP 1 -->
	<div class:hidden={step !== 1} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Informations</h2>

			<p class="text-muted-foreground text-sm">Présentez-vous avant de proposer un partenariat.</p>
		</div>

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

		<Form.Field {form} name="companyName">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Entreprise (optionnel)</Form.Label>

					<Input {...props} bind:value={$formData.companyName} class={fieldClass} />
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>

		<div class="grid grid-cols-2 gap-4">
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>

						<Input type="email" {...props} bind:value={$formData.email} class={fieldClass} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="phone">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Téléphone</Form.Label>

						<Input {...props} bind:value={$formData.phone} class={fieldClass} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>
		</div>
	</div>

	<!-- STEP 2 -->
	<div class:hidden={step !== 2} class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold">Partenariat</h2>

			<p class="text-muted-foreground text-sm">
				Expliquez votre activité et votre proposition de collaboration.
			</p>
		</div>

		<Form.Field {form} name="presentation">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Présentation</Form.Label>

					<Textarea
						placeholder="Présentez votre activité, votre entreprise ou votre projet..."
						{...props}
						bind:value={$formData.presentation}
						class={textareaClass}
					/>
				{/snippet}
			</Form.Control>

			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="partnershipProposal">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Proposition de partenariat</Form.Label>

					<Textarea
						placeholder="Expliquez comment vous souhaitez collaborer avec l'association..."
						{...props}
						bind:value={$formData.partnershipProposal}
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
			<Button type="submit">Envoyer la demande</Button>
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
