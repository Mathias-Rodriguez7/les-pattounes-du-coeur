<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { sosFormSchema } from '$lib/schema/sosForm';

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

	const { form: formData, enhance } = form;

	const alertTypes = [
		{ value: 'abandon', label: 'Abandon' },
		{ value: 'feeding_spot', label: 'Point de nourrissage' },
		{ value: 'found', label: 'Chat trouvé' },
		{ value: 'danger', label: 'Chat en danger' },
		{ value: 'other', label: 'Autre' }
	];

	const selectedLabel = (value: string) =>
		alertTypes.find((t) => t.value === value)?.label ?? 'Choisir un type';
</script>

<form method="POST" use:enhance class="space-y-6">
	<!-- TYPE ALERT (UI only) -->
	<Form.Field {form} name="alertType">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Type de signalement</Form.Label>

				<Select.Root type="single" bind:value={$formData.alertType}>
					<Select.Trigger {...props}>
						{selectedLabel($formData.alertType)}
					</Select.Trigger>

					<Select.Content>
						<Select.Group>
							{#each alertTypes as type (type.value)}
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

	<!-- IDENTITÉ -->
	<div class="grid grid-cols-2 gap-4">
		<Form.Field {form} name="firstName">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Prénom</Form.Label>
					<Input {...props} bind:value={$formData.firstName} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="lastName">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Nom</Form.Label>
					<Input {...props} bind:value={$formData.lastName} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<!-- CONTACT -->
	<Form.Field {form} name="phone">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Téléphone</Form.Label>
				<Input {...props} bind:value={$formData.phone} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input type="email" {...props} bind:value={$formData.email} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- LOCALISATION -->
	<Form.Field {form} name="address">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Lieu du signalement</Form.Label>
				<Input placeholder="Adresse ou lieu" {...props} bind:value={$formData.address} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- DESCRIPTION -->
	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Description</Form.Label>
				<Textarea
					placeholder="Décrivez la situation..."
					{...props}
					bind:value={$formData.description}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- SUBMIT -->
	<div class="flex justify-end">
		<Button type="submit">Envoyer le signalement</Button>
	</div>
</form>
