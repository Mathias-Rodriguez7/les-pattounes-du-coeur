<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { ArrowRight, LoaderCircle } from '@lucide/svelte';
	import InputField from '#lib/components/fields/InputField.svelte';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import { ASSO_CAT_STATUS } from '#lib/constants/cat.ts';
	import type { CatFull } from '#lib/types/cat.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Passer un chat libre en chat asso : la bénévole choisit son statut, et donne un N° Pattounes
	// s'il n'en a pas encore. Ses infos de chat libre restent (carte « Origine : chat libre »).
	interface Props {
		cat: CatFull;
	}

	let { cat }: Props = $props();

	let open = $state(false);
	let status = $state('SOCIALIZE');
	let catNumber = $state('');
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});
	const error = (key: string) => errors[key]?.[0];

	$effect(() => {
		if (!open) return;
		status = 'SOCIALIZE';
		catNumber = '';
		errors = {};
	});

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				open = false;
				await update();
			} else if (result.type === 'failure') {
				errors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur');
			} else {
				toast.error('Erreur serveur');
			}
		};
	};
</script>

<Button size="sm" variant="outline" onclick={() => (open = true)}>
	<ArrowRight class="size-4" />
	Passer en chat asso
</Button>

<Dialog.Root bind:open>
	<Dialog.Content size="sm">
		<Dialog.Header>
			<Dialog.Title>Passer en chat asso</Dialog.Title>
			<Dialog.Description>
				Le chat entre dans le parcours de l'asso (FA, adoption…). Ses infos de chat libre restent
				visibles sur sa fiche.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/convertFreeCat" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="catId" value={cat.id} />
			<div>
				<SelectField
					id="free-convert-status-{cat.id}"
					name="status"
					label="Nouveau statut"
					options={ASSO_CAT_STATUS}
					bind:value={status}
					required
				/>
				{#if error('status')}<p class="mt-1 text-xs text-destructive">{error('status')}</p>{/if}
			</div>
			{#if !cat.catNumber}
				<InputField
					id="free-convert-number-{cat.id}"
					name="catNumber"
					label="N° Pattounes"
					placeholder="C2511005"
					bind:value={catNumber}
					error={error('catNumber')}
					required
					size="sm"
				/>
			{/if}

			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={submitting}
				>
					Annuler
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}<LoaderCircle class="size-4 animate-spin" />{/if}
					Confirmer
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
