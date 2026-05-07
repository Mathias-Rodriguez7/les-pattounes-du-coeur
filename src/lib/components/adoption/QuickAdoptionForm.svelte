<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { ChevronRight, ChevronLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { QuickAdoptionFormSchema, step1Schema, step2Schema } from '$lib/schema/QuickAdoptionForm';

	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { get } from 'svelte/store';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { fade, fly } from 'svelte/transition';

	let {
		data
	}: {
		data: {
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
				toast.error("Une erreur s'est produite ❌");
			}
		}
	});

	// ⚠️ IMPORTANT
	const { form: formData, enhance } = form;

	// ✅ STATE
	let step = $state(1);
	const totalSteps = 2;

	const progress = $derived((step / totalSteps) * 100);

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

	// ✅ STYLES
	const fieldClass =
		'border bg-background px-4 text-left shadow-sm transition hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-primary/40';

	const textarea = 'hover:bg-foreground/10 min-h-28 w-full rounded-2xl px-4 py-3';
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="p-8">
		<Card.Root class="mx-auto w-full max-w-xl">
			<Card.Header class="gap-4 text-center">
				<Card.Title>Trouvez votre futur compagnon</Card.Title>

				<Card.Description class="space-y-3 text-left leading-relaxed">
					<p>
						Vous souhaitez adopter un minou, mais vous ne savez plus où donner de la tête avec tous
						ces chats à l’adoption ?
					</p>

					<p>
						Nous pouvons vous aider à trouver un compagnon qui correspond à votre profil et vos
						envies.
					</p>

					<p>
						En remplissant ce formulaire, nous vous proposerons des chats adaptés à votre situation.
					</p>
				</Card.Description>
			</Card.Header>

			<Card.Content>
				<form method="POST" use:enhance class="space-y-6">
					<!-- 👤 STEP 1 -->
					<div class:hidden={step !== 1}>
						<div class="space-y-6">
							<h2>Profil</h2>
							<div class="grid grid-cols-2 gap-4">
								<Form.Field {form} name="firstName">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Prénom</Form.Label>
											<Input {...props} bind:value={$formData.firstName} class={fieldClass} />
										{/snippet}
									</Form.Control>
								</Form.Field>

								<Form.Field {form} name="lastName">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Nom</Form.Label>
											<Input {...props} bind:value={$formData.lastName} class={fieldClass} />
										{/snippet}
									</Form.Control>
								</Form.Field>
							</div>

							<Form.Field {form} name="address">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Adresse</Form.Label>
										<Input {...props} bind:value={$formData.address} class={fieldClass} />
									{/snippet}
								</Form.Control>
							</Form.Field>

							<Form.Field {form} name="email">
								<Form.Control>
									{#snippet children({ props })}
										<Form.Label>Email</Form.Label>
										<Input
											type="email"
											{...props}
											bind:value={$formData.email}
											class={fieldClass}
										/>
									{/snippet}
								</Form.Control>
							</Form.Field>

							<div class="grid grid-cols-2 gap-4">
								<Form.Field {form} name="phone">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Téléphone</Form.Label>
											<Input {...props} bind:value={$formData.phone} class={fieldClass} />
										{/snippet}
									</Form.Control>
								</Form.Field>

								<Form.Field {form} name="age">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Âge</Form.Label>
											<Input
												type="number"
												{...props}
												bind:value={$formData.age}
												class={fieldClass}
											/>
										{/snippet}
									</Form.Control>
								</Form.Field>
							</div>
						</div>
					</div>

					<!-- 🏠 STEP 2 -->
					<div class:hidden={step !== 2}>
						<div class="space-y-6">
							<h2>Votre foyer</h2>
							<!-- LOGEMENT -->
							<div class="space-y-4">
								<Form.Field {form} name="housingSize">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Logement (m²)</Form.Label>
											<Input type="number" {...props} bind:value={$formData.housingSize} />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>

								<Form.Field {form} name="hasGarden">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Jardin</Form.Label>

											<Checkbox
												{...props}
												checked={$formData.hasGarden}
												onCheckedChange={(v) => ($formData.hasGarden = Boolean(v))}
											/>
										{/snippet}
									</Form.Control>
								</Form.Field>

								{#if $formData.hasGarden}
									<Form.Field {form} name="gardenSize">
										<Form.Control>
											{#snippet children({ props })}
												<Form.Label>Taille jardin (m²)</Form.Label>
												<Input type="number" {...props} bind:value={$formData.gardenSize} />
											{/snippet}
										</Form.Control>
										<Form.FieldErrors />
									</Form.Field>
								{/if}
							</div>

							<!-- ANIMAUX -->
							<div class="space-y-4">
								<Form.Field {form} name="hasPets">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Vous avez des animaux ?</Form.Label>
											<Checkbox
												{...props}
												checked={$formData.hasPets}
												onCheckedChange={(v) => ($formData.hasPets = Boolean(v))}
											/>
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>

								{#if $formData.hasPets}
									<div class="space-y-4">
										<div class="grid grid-cols-2 gap-4">
											<Form.Field {form} name="numberOfCats">
												<Form.Control>
													{#snippet children({ props })}
														<Form.Label>Chat</Form.Label>
														<Input type="number" {...props} bind:value={$formData.numberOfCats} />
													{/snippet}
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>

											<Form.Field {form} name="numberOfDogs">
												<Form.Control>
													{#snippet children({ props })}
														<Form.Label>Chien</Form.Label>
														<Input type="number" {...props} bind:value={$formData.numberOfDogs} />
													{/snippet}
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</div>
										<Form.Field {form} name="otherPets">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>Autres animaux</Form.Label>
													<Textarea
														{...props}
														bind:value={$formData.otherPets}
														placeholder="Ex: lapin, hamster, perroquet..."
														class={textarea}
													/>
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
									</div>
								{/if}
							</div>

							<!-- FOYER -->
							<div class="space-y-4">
								<Form.Field {form} name="numberOfChildren">
									<Form.Control>
										{#snippet children({ props })}
											<Form.Label>Enfants</Form.Label>
											<Input type="number" {...props} bind:value={$formData.numberOfChildren} />
										{/snippet}
									</Form.Control>
									<Form.FieldErrors />
								</Form.Field>
							</div>
						</div>
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
