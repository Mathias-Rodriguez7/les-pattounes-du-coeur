<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { sosFormSchema } from '#lib/schemas/formShema/sosForm.ts';
	import { SOS_ALERT_TYPE_OPTIONS } from '#lib/constants/sos.ts';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';

	let { data }: { data: SuperValidated<Infer<typeof sosFormSchema>> } = $props();

	// superForm ne doit recevoir que les données de DÉPART : il gère ensuite son propre état
	// svelte-ignore state_referenced_locally
	const form = superForm(data, {
		validators: zod4Client(sosFormSchema),

		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Signalement envoyé, merci 🙏 Nous vous recontactons rapidement.');
				form.reset();
			}

			if (result.type === 'failure') {
				toast.error(
					result.status === 400
						? 'Veuillez corriger les erreurs du formulaire'
						: ((result.data?.message as string) ?? "Une erreur s'est produite")
				);
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;
</script>

<form method="POST" action="?/sos" use:enhance class="space-y-6">
	<!-- Anti-spam : invisible et hors du parcours clavier pour les humains, les robots le remplissent.
	     style (et non une classe) : ce champ ne doit JAMAIS redevenir visible -->
	<div
		style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;"
		aria-hidden="true"
	>
		<label for="sos-website">Site web</label>
		<input
			id="sos-website"
			name="website"
			type="text"
			tabindex="-1"
			autocomplete="off"
			bind:value={$formData.website}
		/>
	</div>

	<!-- TYPE ALERT -->
	<SelectField
		id="alertType"
		name="alertType"
		label="Type de signalement"
		placeholder="Choisir un type"
		options={SOS_ALERT_TYPE_OPTIONS}
		bind:value={$formData.alertType}
		required
		size="sm"
	/>
	{#if $errors.alertType}
		<p class="-mt-4 text-xs text-red-500">{$errors.alertType[0]}</p>
	{/if}

	<!-- IDENTITÉ -->
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

	<!-- CONTACT -->
	<div class="grid grid-cols-2 gap-4">
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

		<InputField
			id="email"
			name="email"
			label="Email"
			type="email"
			bind:value={$formData.email}
			error={$errors.email?.[0]}
			required
			size="sm"
		/>
	</div>

	<!-- LOCALISATION -->
	<InputField
		id="address"
		name="address"
		label="Lieu du signalement"
		placeholder="Adresse ou lieu"
		bind:value={$formData.address}
		error={$errors.address?.[0]}
		required
		size="sm"
	/>

	<!-- DESCRIPTION -->
	<TextareaField
		id="description"
		name="description"
		label="Description"
		placeholder="Décrivez la situation..."
		bind:value={$formData.description}
		error={$errors.description?.[0]}
		required
	/>

	<!-- SUBMIT -->
	<div class="flex justify-end">
		<button
			type="submit"
			disabled={$delayed}
			class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
		>
			{$delayed ? 'Envoi...' : 'Envoyer le signalement'}
		</button>
	</div>
</form>
