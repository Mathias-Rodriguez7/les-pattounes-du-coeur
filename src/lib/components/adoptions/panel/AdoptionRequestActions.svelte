<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.ts';
	import RejectFormDialog from '#lib/components/forms/RejectFormDialog.svelte';
	import type { AdoptionFormJson, FormWithRelations } from '#lib/types/form.ts';

	// Les décisions, en bas de la demande : refuser, ou passer à l'adoption
	//   - demande précise : le chat est connu → « Créer l'adoption »
	//   - demande libre : il faut d'abord choisir un chat → « Choisir un chat »
	interface Props {
		form: FormWithRelations;
		/** Le chat de la demande précise est connu (sinon le bouton est grisé) */
		hasCat: boolean;
		/** Blacklist et pas admin : la décision est réservée à l'admin */
		isBlocked: boolean;
		onCreate: () => void;
		onPickCat: () => void;
	}

	let { form, hasCat, isBlocked, onCreate, onPickCat }: Props = $props();

	const data = $derived(form.data as AdoptionFormJson);
	const requesterName = $derived(`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim());
</script>

<div class="flex flex-wrap justify-end gap-2">
	<RejectFormDialog formId={form.id} {requesterName} />
	{#if form.type === 'ADOPTION_SPECIFIC'}
		<Button
			type="button"
			disabled={!hasCat || isBlocked}
			title={isBlocked ? 'Blacklist : décision réservée à l’admin' : undefined}
			onclick={onCreate}
		>
			Créer l'adoption
		</Button>
	{:else if form.type === 'ADOPTION_FLEXIBLE'}
		<Button type="button" onclick={onPickCat}>Choisir un chat</Button>
	{/if}
</div>
