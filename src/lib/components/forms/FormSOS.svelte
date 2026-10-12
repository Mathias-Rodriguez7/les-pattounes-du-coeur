<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { sosFormSchema } from '$lib/schemas/formShema/sosForm';
	import InputField from '$lib/components/fields/InputField.svelte';
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import TextareaField from '$lib/components/fields/TextareaField.svelte';

	let { data } = $props<{
		data: SuperValidated<Infer<typeof sosFormSchema>>;
	}>();

	const form = superForm(data, {
		validators: zod4Client(sosFormSchema),

		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Demande envoyée avec succès 🎉');
				form.reset();
			}

			if (result.type === 'failure') {
				toast.error("Une erreur s'est produite ❌");
			}
		}
	});

	const { form: formData, enhance, errors, delayed } = form;

	const alertTypes = [
		{ value: 'abandon', label: 'Abandons / problèmes de comportement au sein de votre foyer' },
		{ value: 'Unneutered', label: 'Chats errants non stérilisés' },
		{ value: 'Sociable_cats_without_owners', label: 'Chats sociables sans propriétaire' },
		{ value: 'found', label: 'Chatons trouvés / vus' },
		{ value: 'other', label: 'Autre' }
	];
</script>

<form method="POST" action="?/sos" use:enhance class="space-y-6">
	<!-- TYPE ALERT -->
	<SelectField
		id="alertType"
		name="alertType"
		label="Type de signalement"
		placeholder="Choisir un type"
		options={alertTypes}
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
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
		>
			{$delayed ? 'Envoi...' : 'Envoyer le signalement'}
		</button>
	</div>
</form>
