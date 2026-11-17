<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import SelectField from '#lib/components/fields/SelectField.svelte';
	import EntityLink from '#lib/components/links/EntityLink.svelte';
	import { MapPin } from '@lucide/svelte';
	import { SOS_CATEGORY } from '#lib/constants/sos.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import { formatAddress, mapsAddressUrl, mapsUrl } from '#lib/utils/geo.ts';
	import type { CatFull } from '#lib/types/cat.ts';
	import type { LinkableSos } from '#lib/server/sos/queries.ts';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// La carte « Signalement » de la fiche d'un chat : le SOS qui l'a fait entrer.
	// Sans SOS : on peut le rattacher à un SOS déjà saisi (ex : un ancien SOS saisi à la main)
	interface Props {
		cat: CatFull;
		/** Peut modifier le chat (admin, ou bénévole associée) */
		canManage: boolean;
		/** Les SOS que l'utilisatrice traite (tous pour l'admin) */
		linkableSos: LinkableSos[];
	}

	let { cat, canManage, linkableSos }: Props = $props();

	const sos = $derived(cat.sos ?? null);
	const point = $derived(
		sos?.latitude != null && sos?.longitude != null
			? { latitude: sos.latitude, longitude: sos.longitude }
			: null
	);
	const place = $derived(sos ? formatAddress(sos) : null);
	const otherCats = $derived(sos ? sos.cats.filter((c) => c.id !== cat.id).length : 0);

	let chosenSos = $state('');
	const sosOptions = $derived(
		linkableSos.map((s) => ({
			value: s.id,
			label: [
				formatDateNum(s.reportedAt),
				`${s.reporterFirstName} ${s.reporterLastName.charAt(0)}.`,
				formatAddress(s)
			]
				.filter(Boolean)
				.join(' · ')
		}))
	);

	const withToast: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message as string);
				chosenSos = '';
				await update({ reset: false });
			} else if (result.type === 'failure') {
				toast.error((result.data?.error as string) ?? 'Erreur');
			}
		};
	};
</script>

<SectionCard icon="alert" title="Signalement" color="red">
	{#snippet action()}
		{#if sos && canManage && sos.canHandle}
			<form method="POST" action="?/linkCatSos" use:enhance={withToast}>
				<input type="hidden" name="catId" value={cat.id} />
				<input type="hidden" name="sosId" value="" />
				<Button type="submit" variant="ghost" size="sm" class="text-xs text-muted-foreground">
					Détacher
				</Button>
			</form>
		{/if}
	{/snippet}

	{#if sos}
		<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
			<div>
				<p class="text-muted-foreground">Date</p>
				<p>{formatDateNum(sos.reportedAt)}</p>
			</div>
			<div>
				<p class="text-muted-foreground">Catégorie</p>
				{#if sos.category}
					<Badge class={SOS_CATEGORY[sos.category].color}>{SOS_CATEGORY[sos.category].label}</Badge>
				{:else}
					<p class="text-muted-foreground">À choisir</p>
				{/if}
			</div>
			<div>
				<p class="text-muted-foreground">Signalé par</p>
				<p>{sos.reporterFirstName} {sos.reporterLastName}</p>
				{#if sos.canSeeReporter && sos.reporterPhone}
					<a
						href={`tel:${sos.reporterPhone.replace(/[^\d+]/g, '')}`}
						class="text-blue-600 underline">{sos.reporterPhone}</a
					>
				{/if}
			</div>
			<div>
				<p class="text-muted-foreground">Traité par</p>
				<p>{sos.handledByName ?? '—'}</p>
			</div>
		</div>
		<div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
			{#if place}<span>{place}</span>{/if}
			{#if point || place}
				<!-- Un site externe (Google Maps) : pas une route de l'appli -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href={point ? mapsUrl(point) : mapsAddressUrl(place ?? '')}
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-1 text-blue-600 underline"
				>
					<MapPin class="size-3" /> Ouvrir dans Maps
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/if}
			<EntityLink kind="sos" id={sos.id} title="Ouvrir le SOS">
				Voir le SOS{otherCats > 0
					? ` (et ses ${otherCats} autre${otherCats > 1 ? 's' : ''} chat${otherCats > 1 ? 's' : ''})`
					: ''}
			</EntityLink>
		</div>
	{:else}
		<p class="text-xs text-muted-foreground">
			Aucun SOS lié{cat.origin ? ` · Origine : ${cat.origin}` : ''}.
		</p>
		{#if canManage && sosOptions.length > 0}
			<!-- Rattacher à un SOS déjà saisi (ceux que je traite ; tous pour l'admin) -->
			<form
				method="POST"
				action="?/linkCatSos"
				use:enhance={withToast}
				class="mt-3 flex flex-wrap items-end gap-2"
			>
				<input type="hidden" name="catId" value={cat.id} />
				<SelectField
					id="cat-link-sos-{cat.id}"
					name="sosId"
					label="Rattacher à un SOS"
					options={sosOptions}
					bind:value={chosenSos}
					placeholder="Choisir un SOS"
					class="w-64"
				/>
				<Button type="submit" size="sm" variant="outline" disabled={!chosenSos}>Rattacher</Button>
			</form>
		{/if}
	{/if}
</SectionCard>
