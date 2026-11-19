<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Check, Megaphone, X } from '@lucide/svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Button } from '#lib/components/ui/button/index.ts';
	import TextareaField from '#lib/components/fields/TextareaField.svelte';
	import { canPublishCats } from '#lib/permissions/publication.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { CatFull } from '#lib/types/cat.ts';

	// Le circuit de publication, en haut de la fiche d'un chat :
	// - pas visible : « Proposer à l'adoption » (la bénévole du chat) ;
	// - proposé : « En attente de validation » ; l'admin et la communication publient ou refusent ;
	// - refusé : le mot de l'équipe, et « Reproposer ».
	interface Props {
		cat: CatFull;
		/** Peut proposer le chat : admin, ou sa bénévole */
		canManage: boolean;
	}

	let { cat, canManage }: Props = $props();

	const mayPublish = $derived(canPublishCats(page.data.user?.role));
	const inCare = $derived(cat.status === 'AVAILABLE' || cat.status === 'SOCIALIZE');
	const requested = $derived(!!cat.publicationRequestedAt);
	const requestedBy = $derived(
		cat.publicationRequestedBy
			? `${cat.publicationRequestedBy.profil.firstName} ${cat.publicationRequestedBy.profil.lastName}`
			: null
	);
	// Rien à montrer : déjà visible, pas géré par l'asso, ou personne ne peut agir
	const shown = $derived(
		inCare && !cat.isVisible && (requested ? canManage || mayPublish : canManage)
	);

	let refuseOpen = $state(false);
	let note = $state('');
	let errors = $state<Record<string, string[] | undefined>>({});

	const withToast: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				refuseOpen = false;
				note = '';
				errors = {};
			} else if (result.type === 'failure') {
				errors = (result.data?.errors as Record<string, string[] | undefined>) ?? {};
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
			await update({ reset: false });
		};
	};
</script>

{#if shown}
	<div
		class="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm {requested
			? 'border-sky-200 bg-sky-50'
			: cat.publicationRefusedAt
				? 'border-amber-200 bg-amber-50'
				: 'border-border bg-muted/50'}"
	>
		<Megaphone class="size-5 shrink-0 text-muted-foreground" />
		<div class="min-w-0 flex-1">
			{#if requested}
				<p class="font-medium">Proposé à l'adoption, en attente de validation</p>
				<p class="text-xs text-muted-foreground">
					{requestedBy ? `Par ${requestedBy}, ` : ''}le {formatDateNum(cat.publicationRequestedAt)}
					{mayPublish ? '· vérifiez la fiche, modifiez-la si besoin, puis publiez' : ''}
				</p>
			{:else if cat.publicationRefusedAt}
				<p class="font-medium">Publication refusée le {formatDateNum(cat.publicationRefusedAt)}</p>
				<p class="text-xs whitespace-pre-line text-muted-foreground">
					{cat.publicationRefusalNote}
				</p>
			{:else}
				<p class="font-medium">Pas encore sur le site</p>
				<p class="text-xs text-muted-foreground">
					Fiche prête ? Proposez-le : l'équipe communication valide la publication.
				</p>
			{/if}
		</div>

		{#if requested && mayPublish}
			<Button size="sm" variant="outline" onclick={() => (refuseOpen = true)}>
				<X class="size-4" /> Refuser
			</Button>
			<form method="POST" action="?/approvePublication" use:enhance={withToast}>
				<input type="hidden" name="catId" value={cat.id} />
				<Button type="submit" size="sm"><Check class="size-4" /> Publier</Button>
			</form>
		{:else if !requested && canManage}
			<form method="POST" action="?/requestPublication" use:enhance={withToast}>
				<input type="hidden" name="catId" value={cat.id} />
				<Button type="submit" size="sm" variant={cat.publicationRefusedAt ? 'outline' : 'default'}>
					{cat.publicationRefusedAt ? 'Reproposer' : "Proposer à l'adoption"}
				</Button>
			</form>
		{/if}
	</div>

	<Dialog.Root bind:open={refuseOpen}>
		<Dialog.Content size="sm">
			<Dialog.Header>
				<Dialog.Title>Refuser la publication</Dialog.Title>
				<Dialog.Description>
					La bénévole verra votre mot sur la fiche, et pourra reproposer le chat.
				</Dialog.Description>
			</Dialog.Header>
			<form method="POST" action="?/refusePublication" use:enhance={withToast} class="grid gap-4">
				<input type="hidden" name="catId" value={cat.id} />
				<TextareaField
					id="refuse-note-{cat.id}"
					name="note"
					label="Ce qui manque"
					placeholder="Il manque des photos, la description est à compléter…"
					bind:value={note}
					error={errors.note?.[0]}
					required
				/>
				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={() => (refuseOpen = false)}
						>Annuler</Button
					>
					<Button type="submit" variant="destructive">Refuser</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/if}
