<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.ts';
	import { LoaderCircle, Pencil } from '@lucide/svelte';
	import FreeCatFields from './FreeCatFields.svelte';
	import DeleteButton from '#lib/components/buttons/DeleteButton.svelte';
	import { catDisplayName } from '#lib/utils/catHelpers.ts';
	import { emptyFreeCatFields, freeCatFieldsFrom } from './freeCatForm.ts';
	import type { CatFull } from '#lib/types/cat.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Modifier un chat libre : le chat, qui paye, le relâchage, le nourrisseur.
	// La date et le vétérinaire de la stérilisation sont un soin : ils se gèrent dans « Soins ».
	interface Props {
		cat: CatFull;
		/** L'admin peut aussi supprimer le chat (une erreur de saisie) */
		isAdmin?: boolean;
	}

	let { cat, isAdmin = false }: Props = $props();
	let isDeleting = $state(false);

	let open = $state(false);
	let fields = $state(emptyFreeCatFields());
	let submitting = $state(false);
	let errors = $state<Record<string, string[] | undefined>>({});
	const error = (key: string) => errors[key]?.[0];

	// À chaque ouverture : on repart des valeurs ACTUELLES
	$effect(() => {
		if (!open) return;
		fields = freeCatFieldsFrom(cat);
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

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon' })}
		aria-label="Modifier les infos de chat libre"
	>
		<Pencil class="size-5" />
	</Dialog.Trigger>
	<Dialog.Content size="xl" class="max-h-[90dvh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Modifier le chat libre</Dialog.Title>
			<Dialog.Description>
				La date et le vétérinaire de la stérilisation sont dans les soins du chat.
			</Dialog.Description>
		</Dialog.Header>

		<form method="POST" action="?/updateFreeCat" use:enhance={handleEnhance} class="grid gap-4">
			<input type="hidden" name="catId" value={cat.id} />
			<FreeCatFields bind:fields {error} disabled={submitting} idPrefix="free-edit-" />

			<div class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<!-- Seulement pour un chat encore libre : un ancien chat libre se supprime depuis sa fiche -->
					{#if isAdmin && cat.status === 'FREE'}
						<DeleteButton
							entityId={cat.id}
							firstName={catDisplayName(cat)}
							lastName={cat.catNumber ?? ''}
							bind:isDeleting
							isSaving={submitting}
							showDelete
							actionName="?/deleteCat"
							fieldName="catId"
							deleteConfirmMessage="Supprimer ce chat libre ? Ses infos, sa stérilisation et ses photos seront perdues."
							onSuccess={() => (open = false)}
						/>
					{/if}
				</div>
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
						Enregistrer
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
