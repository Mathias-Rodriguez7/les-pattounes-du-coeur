<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import type { CatFull } from '#lib/types/cat.ts';
	import {
		catAltText,
		catDisplayName,
		focalPointStyle,
		getSexIcon
	} from '#lib/utils/catHelpers.ts';
	import { getAgeBadge } from '#lib/utils/age.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { ChevronRight } from '@lucide/svelte';
	import { publicMediaUrl } from '#lib/media/urls.ts';
	import { getAdoptionTone } from '#lib/utils/adoption.ts';
	import { ADOPTION_TONE } from '#lib/constants/adoption.ts';
	import { PUBLICATION_STATE, type PublicationState } from '#lib/permissions/publication.ts';

	const {
		cat,
		onclick,
		isSelected = false,
		publication = null
	}: {
		cat: CatFull;
		onclick: () => void;
		isSelected?: boolean;
		/** Onglet « Publication » : où en est la demande (petit badge sous le nom) */
		publication?: PublicationState | null;
	} = $props();

	// $derived : recalculés quand `cat` change (ex : après un rechargement des données)
	const sexIcon = $derived(getSexIcon(cat.sex));
	// La galerie est triée : la photo principale arrive en premier
	const primaryMedia = $derived(cat.media[0] ?? null);
	const imageSrc = $derived(
		primaryMedia ? publicMediaUrl(primaryMedia.file.storageKey) : '/img/logo.png'
	);
	const imageStyle = $derived(focalPointStyle(primaryMedia));
	// Chat adopté : le nom prend la couleur de l'état de l'adoption (essai, à finaliser, définitive)
	const adoptionTone = $derived(getAdoptionTone(cat));
	const tone = $derived(adoptionTone ? ADOPTION_TONE[adoptionTone] : null);
	const volunteerNames = $derived(
		cat.volunteers
			.map((cv) => `${cv.volunteer.profil.firstName} ${cv.volunteer.profil.lastName.charAt(0)}.`)
			.join(', ')
	);
	const activeSicknessesCount = $derived(
		cat.sicknesses.filter((s) => s.status !== 'RESOLVED').length
	);
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
	{onclick}
	data-row-id={cat.id}
>
	<Table.Cell>
		<img
			src={imageSrc}
			alt={catAltText(cat)}
			loading="lazy"
			class="size-9 rounded-full object-cover sm:size-12"
			style={imageStyle}
		/>
	</Table.Cell>

	<!-- Nom, et dessous le N° (et la ville du relâchage pour un chat libre) -->
	<Table.Cell class="max-w-32 sm:max-w-44" title={tone?.label}>
		<span class="block truncate font-medium {tone?.textClass ?? ''}">{catDisplayName(cat)}</span>
		<span class="flex items-center gap-1.5 text-xs text-muted-foreground">
			<span class="truncate">
				{[cat.catNumber, cat.status === 'FREE' ? cat.freeInfo?.city : null]
					.filter(Boolean)
					.join(' · ') || '—'}
			</span>
			{#if publication}
				<span
					class="shrink-0 rounded-md px-1.5 font-medium {PUBLICATION_STATE[publication].badgeClass}"
				>
					{PUBLICATION_STATE[publication].label}
				</span>
			{/if}
		</span>
		{#if tone}
			<span class="sr-only">({tone.label})</span>
		{/if}
	</Table.Cell>

	<Table.Cell class="text-center">
		<div title={sexIcon.label} class="flex justify-center">
			<Icon name={sexIcon.icon} class="size-5 sm:size-6 {sexIcon.color}" />
		</div>
	</Table.Cell>

	<Table.Cell class="text-xs sm:text-sm">{getAgeBadge(cat.birthDate)}</Table.Cell>

	<Table.Cell class="text-center sm:text-left">
		{#if activeSicknessesCount > 0}
			<Badge variant="outline" class="text-xs">{activeSicknessesCount}</Badge>
		{:else}
			<span class="text-xs text-muted-foreground">
				<span class="sm:hidden">—</span>
				<span class="hidden sm:inline">Aucune</span>
			</span>
		{/if}
	</Table.Cell>

	<!-- La ou les bénévoles associées : « Julie M. » -->
	<Table.Cell class="hidden max-w-32 text-xs md:table-cell">
		{#if volunteerNames}
			<span class="block truncate" title={volunteerNames}>{volunteerNames}</span>
		{:else}
			<span class="text-muted-foreground">—</span>
		{/if}
	</Table.Cell>

	<Table.Cell class="w-6 px-0 text-muted-foreground sm:hidden">
		<ChevronRight class="size-4" />
	</Table.Cell>
</Table.Row>
