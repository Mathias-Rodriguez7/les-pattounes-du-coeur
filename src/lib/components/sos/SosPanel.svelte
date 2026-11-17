<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import EntityLink from '#lib/components/links/EntityLink.svelte';
	import SosEditForm from './SosEditForm.svelte';
	import SosAssignDialog from './SosAssignDialog.svelte';
	import SosDismissDialog from './SosDismissDialog.svelte';
	import { Cat, Hand, Mail, MapPin, Pencil, Phone, Plus, Siren } from '@lucide/svelte';
	import { SOS_CATEGORY, SOS_DISMISS_REASON, SOS_SOURCE, SOS_STATUS } from '#lib/constants/sos.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import { districtLabel } from '#lib/utils/districts.ts';
	import { formatAddress, formatCoordinates, mapsAddressUrl, mapsUrl } from '#lib/utils/geo.ts';
	import type { SosView } from '#lib/server/sos/queries.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Le panneau d'un SOS, comme la fiche d'un chat ou d'une FA :
	// - en lecture : qui signale, le lieu, le signalement (catégorie, situation), les chats ;
	// - le crayon (bénévole qui le traite, ou admin) remplace ces cartes par le formulaire.
	interface Props {
		sos: SosView | null;
		isAdmin: boolean;
		/** Pour « Confier à » (admin) */
		volunteers: { id: string; name: string }[];
		/** « Créer un chat » : la page ouvre le formulaire « Nouveau chat » lié à ce SOS */
		onCreateCat: (sos: SosView) => void;
	}

	let { sos, isAdmin, volunteers, onCreateCat }: Props = $props();

	let isEditing = $state(false);

	// Un autre SOS choisi : on revient en lecture
	$effect(() => {
		if (sos?.id) isEditing = false;
	});

	const place = $derived(sos ? formatAddress(sos) : null);
	const districtName = $derived(sos ? districtLabel(sos.district) : null);
	const point = $derived(
		sos?.latitude != null && sos?.longitude != null
			? { latitude: sos.latitude, longitude: sos.longitude }
			: null
	);
	const isOpen = $derived(sos?.status === 'IN_PROGRESS' || sos?.status === 'CLOSED');
	const canEdit = $derived(!!sos?.canHandle && sos.status !== 'DISMISSED');

	const withToast: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				await update({ reset: false });
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
		};
	};
</script>

{#if sos}
	<Card.Root class="@container flex h-full flex-col">
		<!-- ===== EN-TÊTE : statut, qui, quand ; prendre en charge, confier, modifier ===== -->
		<Card.Header class="gap-3">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<Badge class={SOS_STATUS[sos.status].color}>{SOS_STATUS[sos.status].label}</Badge>
						{#if sos.category}
							<Badge class={SOS_CATEGORY[sos.category].color}>
								{SOS_CATEGORY[sos.category].label}
							</Badge>
						{/if}
					</div>
					<Card.Title class="mt-2 text-xl font-bold">
						SOS du {formatDateNum(sos.reportedAt)} · {sos.reporterFirstName}
						{sos.reporterLastName}
					</Card.Title>
					<Card.Description class="mt-1">
						{SOS_SOURCE[sos.source]} · traité par
						<span class="font-medium text-foreground">{sos.handledByName ?? 'personne encore'}</span
						>
					</Card.Description>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					{#if sos.canTake}
						<form method="POST" action="?/takeSos" use:enhance={withToast}>
							<input type="hidden" name="sosId" value={sos.id} />
							<Button type="submit"><Hand class="size-4" /> Je le prends en charge</Button>
						</form>
					{/if}
					{#if isAdmin && sos.status !== 'DISMISSED' && !isEditing}
						<SosAssignDialog sosId={sos.id} currentId={sos.handledById} {volunteers} />
					{/if}
					{#if canEdit && !isEditing}
						<Button
							variant="ghost"
							size="icon"
							onclick={() => (isEditing = true)}
							aria-label="Modifier le SOS"
						>
							<Pencil class="size-5" />
						</Button>
					{/if}
				</div>
			</div>
		</Card.Header>

		<Card.Content class="flex flex-col gap-6 text-sm">
			<Separator />

			{#if isEditing}
				<!-- ===== MODIFICATION : le formulaire remplace les cartes ===== -->
				<SosEditForm {sos} onDone={() => (isEditing = false)} />
			{:else}
				<!-- ===== LECTURE ===== -->
				<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2">
					<SectionCard icon="user" title="La personne qui signale" color="rose">
						<p class="font-medium">{sos.reporterFirstName} {sos.reporterLastName}</p>
						{#if sos.canSeeReporter}
							<div class="mt-2 grid gap-1 text-xs">
								{#if sos.reporterPhone}
									<a
										href={`tel:${sos.reporterPhone.replace(/[^\d+]/g, '')}`}
										class="flex items-center gap-2 text-blue-600 underline"
									>
										<Phone class="size-4" />{sos.reporterPhone}
									</a>
								{/if}
								{#if sos.reporterEmail}
									<a
										href={`mailto:${sos.reporterEmail}`}
										class="flex items-center gap-2 break-all text-blue-600 underline"
									>
										<Mail class="size-4 shrink-0" />{sos.reporterEmail}
									</a>
								{/if}
							</div>
						{:else}
							<p class="mt-2 text-xs text-muted-foreground">
								Le contact est visible par la bénévole qui traite ce SOS.
							</p>
						{/if}
					</SectionCard>

					<SectionCard icon="map" title="Le lieu" color="blue">
						<p>{place ?? 'Lieu non renseigné'}</p>
						{#if districtName}
							<p class="text-xs text-muted-foreground">Quartier {districtName}</p>
						{/if}
						{#if point}
							<p class="mt-1 font-mono text-xs text-muted-foreground">{formatCoordinates(point)}</p>
						{/if}
						{#if point || place}
							<!-- Un site externe (Google Maps) : pas une route de l'appli -->
							<!-- eslint-disable svelte/no-navigation-without-resolve -->
							<a
								href={point ? mapsUrl(point) : mapsAddressUrl(place ?? '')}
								target="_blank"
								rel="noopener noreferrer"
								class="mt-2 flex items-center gap-2 text-xs text-blue-600 underline"
							>
								<MapPin class="size-4" />
								{point ? 'Ouvrir la position GPS dans Maps' : 'Chercher l’adresse dans Maps'}
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{/if}
					</SectionCard>
				</section>

				<SectionCard icon="note" title="Le signalement" color="amber">
					<div class="grid gap-3">
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground">Catégorie :</span>
							{#if sos.category}
								<Badge class={SOS_CATEGORY[sos.category].color}>
									{SOS_CATEGORY[sos.category].label}
								</Badge>
							{:else}
								<span class="text-muted-foreground italic">à choisir</span>
							{/if}
						</div>
						<p class="whitespace-pre-line">{sos.description ?? 'Pas de description.'}</p>
					</div>
				</SectionCard>
			{/if}

			<!-- ===== SANS SUITE ===== -->
			{#if sos.status === 'DISMISSED'}
				<div class="grid gap-2 rounded-xl bg-muted p-4">
					<p class="font-medium">
						Classé sans suite{#if sos.closedAt}
							le {formatDateNum(sos.closedAt)}{/if} :
						{sos.dismissReason ? SOS_DISMISS_REASON[sos.dismissReason] : '—'}
					</p>
					{#if sos.dismissNote}<p class="whitespace-pre-line">{sos.dismissNote}</p>{/if}
					{#if sos.canHandle}
						<form method="POST" action="?/reopenSos" use:enhance={withToast}>
							<input type="hidden" name="sosId" value={sos.id} />
							<Button type="submit" variant="outline" size="sm">Rouvrir le SOS</Button>
						</form>
					{/if}
				</div>
			{/if}

			<!-- ===== LES CHATS ===== -->
			{#if !isEditing}
				<SectionCard icon="cat" title="Chats pris en charge ({sos.cats.length})" color="orange">
					{#snippet action()}
						{#if sos.canHandle && isOpen}
							<Button size="sm" variant="outline" onclick={() => onCreateCat(sos)}>
								<Plus class="size-4" /> Créer un chat
							</Button>
						{/if}
					{/snippet}
					{#if sos.cats.length > 0}
						<ul class="grid gap-1">
							{#each sos.cats as cat (cat.id)}
								<li class="flex items-center gap-2">
									<Cat class="size-4 text-amber-600" />
									<EntityLink kind="cat" id={cat.id}>{cat.name ?? cat.catNumber}</EntityLink>
									<span class="text-xs text-muted-foreground">{cat.catNumber}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-xs text-muted-foreground">
							{sos.status === 'NEW'
								? 'Prenez le SOS en charge pour créer ses chats.'
								: 'Aucun chat pour l’instant. Un chat déjà créé se rattache depuis sa fiche (carte « Signalement »).'}
						</p>
					{/if}
				</SectionCard>

				{#if sos.canHandle && sos.status === 'IN_PROGRESS'}
					<div class="flex justify-end border-t pt-4">
						<SosDismissDialog sosId={sos.id} />
					</div>
				{/if}
			{/if}
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Siren class="mx-auto mb-2 size-8 opacity-50" />
			<p class="text-sm">Sélectionnez un SOS</p>
		</Card.Content>
	</Card.Root>
{/if}
