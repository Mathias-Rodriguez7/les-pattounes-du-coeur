<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Hourglass, RotateCw, X } from '@lucide/svelte';
	import PersonProfileView from '#lib/components/person/PersonProfileView.svelte';
	import PersonContactView from '#lib/components/person/PersonContactView.svelte';
	import PersonAddressView from '#lib/components/person/PersonAddressView.svelte';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { PendingInvitation } from '#lib/server/invitations/queries.ts';

	// Le panneau d'une candidature : qui, quand, le lien, les infos saisies (lecture seule),
	// et les actions de l'admin : renvoyer le lien, ou annuler
	interface Props {
		candidate: PendingInvitation;
		/** « la Convention FA » / « le Manuel de la gestionnaire » */
		documentName: string;
		isAdmin: boolean;
		/** Renvoyer crée une NOUVELLE invitation : la page sélectionne son id */
		onResent: (invitationId: string) => void;
		onCancelled: () => void;
		/** Ce qui est propre à la sorte de candidature (l'accueil d'une FA, le rôle d'une bénévole) */
		details?: Snippet;
	}

	let { candidate, documentName, isAdmin, onResent, onCancelled, details }: Props = $props();

	let busy = $state(false);

	const handleEnhance =
		(onDone: (data: Record<string, unknown> | undefined) => void): SubmitFunction =>
		() => {
			busy = true;
			return async ({ result, update }) => {
				busy = false;
				if (result.type === 'success') {
					const message = (result.data?.message as string) ?? 'C’est fait';
					if (result.data?.emailSent === false) toast.warning(message);
					else toast.success(message);
					await update();
					onDone(result.data);
				} else if (result.type === 'failure') {
					toast.error((result.data?.error as string) ?? 'Erreur');
					await update();
				}
			};
		};

	const person = $derived(candidate.person);
</script>

<Card.Root class="flex h-full flex-col">
	<Card.Header class="gap-3">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div class="min-w-0">
				{#if candidate.expired}
					<Badge class="bg-red-100 text-red-800">Lien expiré</Badge>
				{:else}
					<Badge class="bg-amber-100 text-amber-800">
						<Hourglass class="size-3" />
						En attente de validation
					</Badge>
				{/if}
				<Card.Title class="mt-2 text-2xl font-bold">{candidate.name}</Card.Title>
				<Card.Description class="mt-1">
					Invitation envoyée le {formatDateNum(candidate.createdAt)}
					{#if candidate.createdByName}par {candidate.createdByName}{/if}
				</Card.Description>
				<p class="mt-1 text-sm {candidate.expired ? 'text-red-700' : 'text-muted-foreground'}">
					{candidate.expired
						? `Le lien a expiré le ${formatDateNum(candidate.expiresAt)} : renvoyez-en un nouveau.`
						: `Lien valable jusqu'au ${formatDateNum(candidate.expiresAt)}.`}
				</p>
			</div>

			{#if isAdmin}
				<div class="flex items-center gap-2">
					<form
						method="POST"
						action="?/resendInvitation"
						use:enhance={handleEnhance((data) => {
							if (typeof data?.invitationId === 'string') onResent(data.invitationId);
						})}
					>
						<input type="hidden" name="invitationId" value={candidate.id} />
						<Button type="submit" variant="outline" size="sm" disabled={busy}>
							<RotateCw class="size-4 {busy ? 'animate-spin' : ''}" />
							Renvoyer
						</Button>
					</form>
					<form method="POST" action="?/cancelInvitation" use:enhance={handleEnhance(onCancelled)}>
						<input type="hidden" name="invitationId" value={candidate.id} />
						<Button
							type="submit"
							variant="ghost"
							size="sm"
							class="text-destructive"
							disabled={busy}
							aria-label="Annuler l'invitation de {candidate.name}"
						>
							<X class="size-4" />
							Annuler
						</Button>
					</form>
				</div>
			{/if}
		</div>

		<p class="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
			{candidate.name} a reçu un email pour lire et accepter {documentName} : sa fiche sera créée à ce
			moment-là. Une erreur dans ses infos ? Annulez l'invitation et recréez-la.
		</p>
	</Card.Header>

	<Card.Content class="@container flex flex-col gap-6 text-sm">
		<Separator />
		<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-10">
			<PersonProfileView
				firstName={person.firstName}
				lastName={person.lastName}
				birthDate={person.birthDate}
				class="@2xl:col-span-3"
			/>
			<PersonContactView phone={person.phone} email={person.email} class="@2xl:col-span-3" />
			<PersonAddressView
				address={person.address}
				city={person.city}
				postalCode={person.postalCode}
				district={person.district}
				class="@2xl:col-span-4"
			/>
		</section>

		{#if details}
			<Separator />
			{@render details()}
		{/if}
	</Card.Content>
</Card.Root>
