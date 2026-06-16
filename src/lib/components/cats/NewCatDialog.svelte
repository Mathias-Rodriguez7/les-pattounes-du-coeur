<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { enhance } from '$app/forms';

	let { open = $bindable() } = $props<{ open: boolean }>();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Nouveau chat</Dialog.Title>
			<Dialog.Description>Renseigne les informations de base du chat.</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/createCat" use:enhance class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<Label for="name">Nom</Label>
				<Input id="name" name="name" placeholder="Sans nom" />
			</div>

			<div class="flex flex-col gap-1">
				<Label for="sex">Sexe</Label>
				<select
					name="sex"
					id="sex"
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					<option value="MALE">Mâle</option>
					<option value="FEMALE">Femelle</option>
					<option value="UNKNOWN">Inconnu</option>
				</select>
			</div>

			<div class="flex flex-col gap-1">
				<Label for="age">Âge (en mois)</Label>
				<Input id="age" name="age" type="number" min="0" placeholder="0" />
			</div>

			<div class="flex flex-col gap-1">
				<Label for="status">Statut</Label>
				<select
					name="status"
					id="status"
					class="border-input bg-background rounded-md border px-3 py-2 text-sm"
				>
					<option value="AVAILABLE">Disponible</option>
					<option value="SOCIALIZE">Socialisation</option>
					<option value="FREE">Libre</option>
				</select>
			</div>

			<Dialog.Footer>
				<Button type="submit">Créer le chat</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
