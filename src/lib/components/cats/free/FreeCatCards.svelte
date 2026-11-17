<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { MapPin } from '@lucide/svelte';
	import FreeCatEditDialog from './FreeCatEditDialog.svelte';
	import { FREE_CAT_STERILIZATION_REASON, payerLabel } from '#lib/constants/freeCat.ts';
	import { formatDateNum } from '#lib/utils/date.ts';
	import { formatAddress, mapsAddressUrl, mapsUrl } from '#lib/utils/geo.ts';
	import { getLabel, sexLabel } from '#lib/utils/catHelpers.ts';
	import type { CatFull } from '#lib/types/cat.ts';

	// Les infos d'un chat libre, en lecture : la stérilisation, le relâchage, le nourrisseur, le chat.
	// Le crayon ouvre la modification. Aussi la carte « Origine : chat libre » d'un chat passé en asso.
	interface Props {
		cat: CatFull;
		/** Admin, ou bénévole du chat */
		canManage: boolean;
		isAdmin?: boolean;
	}

	let { cat, canManage, isAdmin = false }: Props = $props();

	const info = $derived(cat.freeInfo);
	// La stérilisation : le soin créé avec le chat libre (sinon, la plus récente)
	const sterilization = $derived(
		cat.cares.find((c) => c.type === 'STERILIZE' && c.reason === FREE_CAT_STERILIZATION_REASON) ??
			cat.cares.find((c) => c.type === 'STERILIZE') ??
			null
	);
	const vetName = $derived(sterilization?.veterinarian?.name ?? sterilization?.veterinary ?? '—');
	const point = $derived(
		info?.latitude != null && info?.longitude != null
			? { latitude: info.latitude, longitude: info.longitude }
			: null
	);
	const place = $derived(info ? formatAddress(info) : null);
	const identification = $derived(
		cat.chipId ? `Puce ${cat.chipId}` : cat.tattooId ? `Tatouage ${cat.tattooId}` : 'Aucune'
	);
	const managers = $derived(
		cat.volunteers.map((cv) => `${cv.volunteer.profil.firstName} ${cv.volunteer.profil.lastName}`)
	);
	// Un téléphone : lien « appeler » (sinon le texte tel quel : un email, une adresse…)
	const phoneHref = $derived(
		info && /^[\d\s.+()-]{8,}$/.test(info.feederContact)
			? `tel:${info.feederContact.replace(/[^\d+]/g, '')}`
			: null
	);
</script>

{#if info}
	<SectionCard
		icon="trees"
		title={cat.status === 'FREE' ? 'Chat libre' : 'Origine : chat libre'}
		color="green"
		variant="plain"
	>
		{#snippet action()}
			{#if canManage}
				<FreeCatEditDialog {cat} {isAdmin} />
			{/if}
		{/snippet}

		<div class="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
			<SectionCard icon="syringe" title="Stérilisation" color="violet">
				<dl class="ml-6 grid gap-1">
					<div class="flex justify-between gap-2">
						<dt class="text-muted-foreground">Date</dt>
						<dd>{sterilization ? formatDateNum(sterilization.date) : '—'}</dd>
					</div>
					<div class="flex justify-between gap-2">
						<dt class="text-muted-foreground">Vétérinaire</dt>
						<dd class="text-right">{vetName}</dd>
					</div>
					<div class="flex justify-between gap-2">
						<dt class="text-muted-foreground">Payée par</dt>
						<dd class="text-right">{payerLabel(info)}</dd>
					</div>
				</dl>
			</SectionCard>

			<SectionCard icon="map" title="Relâchage" color="emerald">
				<div class="ml-6 grid gap-1">
					<p>{place ?? '—'}</p>
					{#if point || place}
						<!-- Un site externe (Google Maps) : pas une route de l'appli -->
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={point ? mapsUrl(point) : mapsAddressUrl(place ?? '')}
							target="_blank"
							rel="noopener noreferrer"
							class="flex w-fit items-center gap-1 text-blue-600 underline"
						>
							<MapPin class="size-3" /> Ouvrir dans Maps
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
				</div>
			</SectionCard>

			<SectionCard icon="user" title="Nourrisseur" color="amber">
				<div class="ml-6 grid gap-1">
					<p class="font-medium">{info.feederName}</p>
					{#if phoneHref}
						<!-- Un lien tel: (appeler) : pas une route de l'appli -->
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a href={phoneHref} class="w-fit text-blue-600 underline">{info.feederContact}</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{:else}
						<p>{info.feederContact}</p>
					{/if}
					{#if info.notes}
						<p class="mt-1 whitespace-pre-line text-muted-foreground">{info.notes}</p>
					{/if}
				</div>
			</SectionCard>

			<SectionCard icon="cat" title="Le chat" color="cyan">
				<dl class="ml-6 grid gap-1">
					<div class="flex justify-between gap-2">
						<dt class="text-muted-foreground">Sexe</dt>
						<dd>{getLabel(sexLabel, cat.sex)}</dd>
					</div>
					<div class="flex justify-between gap-2">
						<dt class="text-muted-foreground">Identification</dt>
						<dd class="text-right">{identification}</dd>
					</div>
					<div class="flex justify-between gap-2">
						<dt class="text-muted-foreground">Gestionnaire</dt>
						<dd class="text-right">{managers.join(', ') || '—'}</dd>
					</div>
					{#if info.convertedAt}
						<div class="flex justify-between gap-2">
							<dt class="text-muted-foreground">Passé en asso</dt>
							<dd>{formatDateNum(info.convertedAt)}</dd>
						</div>
					{/if}
				</dl>
			</SectionCard>
		</div>
	</SectionCard>
{/if}
