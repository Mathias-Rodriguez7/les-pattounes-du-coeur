<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { BellRing } from '@lucide/svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	// Le récapitulatif du lundi : ses tâches de la semaine par email. Activé par défaut.
	// Le changement s'enregistre tout de suite (pas de bouton « Enregistrer »)
	interface Props {
		weeklyDigest: boolean;
	}

	let { weeklyDigest }: Props = $props();

	let form = $state<HTMLFormElement>();
	// svelte-ignore state_referenced_locally
	let checked = $state(weeklyDigest);

	const handleEnhance: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(
					checked ? 'Récapitulatif du lundi activé' : 'Récapitulatif du lundi désactivé'
				);
			} else {
				checked = !checked;
				toast.error("Impossible d'enregistrer ce choix");
			}
			await update({ reset: false });
		};
	};
</script>

<Card.Root class="gap-0 self-start py-0">
	<Card.Header class="px-6 py-4">
		<Card.Title class="flex items-center gap-2 text-base">
			<BellRing class="size-4 text-primary" />
			Notifications
		</Card.Title>
	</Card.Header>

	<Separator />

	<Card.Content class="p-4">
		<form
			bind:this={form}
			method="POST"
			action="?/setWeeklyDigest"
			use:enhance={handleEnhance}
			class="flex items-start gap-3"
		>
			<input type="hidden" name="weeklyDigest" value={checked ? 'true' : 'false'} />
			<Switch
				id="weekly-digest"
				bind:checked
				onCheckedChange={() => form?.requestSubmit()}
				class="mt-0.5"
			/>
			<Label for="weekly-digest" class="grid cursor-pointer gap-1 font-normal">
				<span class="text-sm font-medium">Récapitulatif du lundi</span>
				<span class="text-xs text-muted-foreground">
					Chaque lundi matin, un email avec vos tâches de la semaine. Rien à faire : pas d'email.
				</span>
			</Label>
		</form>
	</Card.Content>
</Card.Root>
