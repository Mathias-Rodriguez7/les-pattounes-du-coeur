<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import { LoaderCircle, UserCheck } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	// « Me l'attribuer » : la même action que le dialogue d'attribution (?/assignVolunteer),
	// avec la personne connectée comme bénévole. Le serveur vérifie qu'elle en a le droit.
	interface Props {
		formId: string;
		userId: string;
	}

	let { formId, userId }: Props = $props();
	let submitting = $state(false);

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success' && result.data?.success) {
				toast.success('Demande attribuée : vous la retrouvez dans « Mes formulaires »');
				// Dans « Tous », la liste ne montre que les demandes à personne : elle en sortirait.
				// On passe sur « Mes formulaires », où elle est maintenant (et reste ouverte)
				if (page.url.searchParams.get('scope') === 'all') {
					// (même principe que l'interrupteur de la page : copie de l'URL, sans « scope »)
					const url = new URL(page.url.href);
					url.searchParams.delete('scope');
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					await goto(`${resolve('dashboard/forms')}${url.search}`, {
						reset: false,
						refreshAll: true
					});
					return;
				}
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? "Erreur lors de l'attribution");
			}
			await update({ reset: false });
		};
	};
</script>

<form method="POST" action="?/assignVolunteer" use:enhance={handleEnhance}>
	<input type="hidden" name="formId" value={formId} />
	<input type="hidden" name="volunteerId" value={userId} />
	<Button type="submit" size="sm" disabled={submitting}>
		{#if submitting}
			<LoaderCircle class="size-4 animate-spin" />
		{:else}
			<UserCheck class="size-4" />
		{/if}
		Me l'attribuer
	</Button>
</form>
