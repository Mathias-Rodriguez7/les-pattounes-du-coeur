<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { LoaderCircle, PlayCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	// « Je commence » : la demande passe « en cours de traitement ». Pour la personne qui en a
	// la charge (ou l'admin) ; le serveur vérifie le droit. Seulement depuis « En attente ».
	interface Props {
		form: { id: string; status: string; assignedToId: string | null };
		/** Le panneau sait déjà si elle peut traiter la demande (ex : bénévole du chat) */
		canManage?: boolean;
	}

	let { form, canManage }: Props = $props();

	const user = $derived(page.data.user as { id: string; role: string } | undefined);
	const allowed = $derived(
		canManage ?? (user?.role === 'ADMIN' || (!!user && form.assignedToId === user.id))
	);
	let submitting = $state(false);

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success' && result.data?.success) {
				toast.success(result.data.message as string);
			} else if (result.type === 'success' || result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
			await update({ reset: false });
		};
	};
</script>

{#if form.status === 'PENDING' && allowed}
	<form method="POST" action="?/markFormInProgress" use:enhance={handleEnhance}>
		<input type="hidden" name="formId" value={form.id} />
		<Button type="submit" size="sm" variant="outline" disabled={submitting}>
			{#if submitting}
				<LoaderCircle class="size-4 animate-spin" />
			{:else}
				<PlayCircle class="size-4" />
			{/if}
			Je commence
		</Button>
	</form>
{/if}
