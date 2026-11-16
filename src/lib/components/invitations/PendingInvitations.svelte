<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { MailCheck, RotateCw, X } from '@lucide/svelte';
	import { formatDateNum } from '#lib/utils/date.ts';
	import type { PendingInvitation } from '#lib/server/invitations/queries.ts';

	// Les inscriptions envoyées mais pas encore acceptées : renvoyer le lien, ou annuler.
	// Affiché seulement s'il y en a (rien ne change sur la page sinon)
	interface Props {
		invitations: PendingInvitation[];
		/** « la Convention FA » / « le Manuel de la gestionnaire » */
		documentName: string;
	}

	let { invitations, documentName }: Props = $props();

	// L'invitation en cours de traitement (bouton grisé + roue)
	let busyId = $state<string | null>(null);

	const handleEnhance =
		(invitationId: string): SubmitFunction =>
		() => {
			busyId = invitationId;
			return async ({ result, update }) => {
				busyId = null;
				if (result.type === 'success') {
					const message = (result.data?.message as string) ?? 'C’est fait';
					if (result.data?.emailSent === false) toast.warning(message);
					else toast.success(message);
				} else if (result.type === 'failure') {
					toast.error((result.data?.error as string) ?? 'Erreur');
				}
				await update();
			};
		};
</script>

{#if invitations.length > 0}
	<Card.Root class="gap-3">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-lg">
				<MailCheck class="size-5 text-primary" />
				Inscriptions en attente ({invitations.length})
			</Card.Title>
			<Card.Description>
				Elles ont reçu un email pour lire et accepter {documentName} : leur fiche sera créée à ce moment-là.
				Un lien est valable 14 jours.
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<ul class="divide-y rounded-xl border">
				{#each invitations as invitation (invitation.id)}
					<li class="flex flex-wrap items-center justify-between gap-3 p-3">
						<div class="min-w-0">
							<p class="truncate font-medium">{invitation.name}</p>
							<p class="truncate text-sm text-muted-foreground">
								{invitation.email} · envoyée le {formatDateNum(invitation.createdAt)}
								{#if invitation.createdByName}par {invitation.createdByName}{/if}
							</p>
						</div>

						<div class="flex items-center gap-2">
							{#if invitation.expired}
								<Badge class="bg-red-100 text-red-800">Lien expiré</Badge>
							{:else}
								<Badge variant="outline">Jusqu'au {formatDateNum(invitation.expiresAt)}</Badge>
							{/if}

							<form
								method="POST"
								action="?/resendInvitation"
								use:enhance={handleEnhance(invitation.id)}
							>
								<input type="hidden" name="invitationId" value={invitation.id} />
								<Button
									type="submit"
									variant="outline"
									size="sm"
									disabled={busyId === invitation.id}
								>
									<RotateCw class="size-4 {busyId === invitation.id ? 'animate-spin' : ''}" />
									Renvoyer
								</Button>
							</form>

							<form
								method="POST"
								action="?/cancelInvitation"
								use:enhance={handleEnhance(invitation.id)}
							>
								<input type="hidden" name="invitationId" value={invitation.id} />
								<Button
									type="submit"
									variant="ghost"
									size="sm"
									class="text-destructive"
									disabled={busyId === invitation.id}
									aria-label="Annuler l'invitation de {invitation.name}"
								>
									<X class="size-4" />
									Annuler
								</Button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</Card.Content>
	</Card.Root>
{/if}
