<script lang="ts">
	import { deserialize } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	// Le récapitulatif du lundi (ses tâches de la semaine par email), à côté de « Enregistrer ».
	// Il s'enregistre tout de suite, à part du formulaire du profil : il vit DANS ce formulaire,
	// et un <form> ne peut pas en contenir un autre, d'où l'envoi direct (fetch) vers l'action.

	let { weeklyDigest }: { weeklyDigest: boolean } = $props();

	// svelte-ignore state_referenced_locally
	let checked = $state(weeklyDigest);
	let saving = $state(false);

	async function save(next: boolean) {
		saving = true;
		const body = new FormData();
		body.set('weeklyDigest', next ? 'true' : 'false');
		try {
			const response = await fetch('?/setWeeklyDigest', {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await response.text());
			if (result.type !== 'success') throw new Error();
			toast.success(next ? 'Récapitulatif du lundi activé' : 'Récapitulatif du lundi désactivé');
		} catch {
			checked = !next;
			toast.error("Impossible d'enregistrer ce choix");
		} finally {
			saving = false;
		}
	}
</script>

<div class="flex items-center gap-3">
	<Switch
		id="weekly-digest"
		bind:checked
		disabled={saving}
		onCheckedChange={(next) => save(next)}
	/>
	<Label for="weekly-digest" class="grid cursor-pointer gap-0.5 font-normal">
		<span class="text-sm font-medium">Récapitulatif du lundi</span>
		<span class="text-xs text-muted-foreground">Un email avec vos tâches de la semaine</span>
	</Label>
</div>
