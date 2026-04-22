<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { adoptionFormSchema } from '$lib/schema/adoptionForm';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { ChevronRight } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data }: { data: { form: SuperValidated<Infer<typeof adoptionFormSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(adoptionFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<div class="p-8">
	<Card.Root class="mx-auto w-full max-w-xl">
		<Card.Header class="text-center">
			<Card.Title>Trouvez votre futur compagnon</Card.Title>
			<Card.Description>
				Avec ce formulaire, nous vous trouverons la boule de poils de vos rêves.
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<form method="POST" use:enhance class="space-y-6">
				<!-- FIRST NAME -->
				<Form.Field {form} name="firstName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>First name</Form.Label>
							<Input {...props} bind:value={$formData.firstName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- LAST NAME -->
				<Form.Field {form} name="lastName">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Last name</Form.Label>
							<Input {...props} bind:value={$formData.lastName} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- ADDRESS -->
				<Form.Field {form} name="address">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Address</Form.Label>
							<Input {...props} bind:value={$formData.address} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- EMAIL -->
				<Form.Field {form} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Email</Form.Label>
							<Input type="email" {...props} bind:value={$formData.email} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- AGE -->
				<Form.Field {form} name="age">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Age</Form.Label>
							<Input type="number" {...props} bind:value={$formData.age} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<!-- BUTTON -->
				<div class="flex justify-end pt-4">
					<Form.Button>
						Next <ChevronRight class="ml-2 h-4 w-4" />
					</Form.Button>
				</div>
			</form>
		</Card.Content>

		<!-- PROGRESS BAR -->
		<Card.Footer class="flex flex-col gap-2">
			<div class="bg-muted h-2 w-full rounded-full">
				<div class="bg-primary h-2 w-1/3 rounded-full transition-all"></div>
			</div>
			<p class="text-muted-foreground text-center text-xs">1 / 3</p>
		</Card.Footer>
	</Card.Root>
</div>
