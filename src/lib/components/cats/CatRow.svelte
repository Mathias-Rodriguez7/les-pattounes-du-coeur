<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import Icon from '#lib/components/Icon.svelte';
	import type { CatFull } from '#lib/types/cat.ts';
	import { focalPointStyle, getSexIcon } from '#lib/utils/catHelpers.ts';
	import { getAgeBadge } from '#lib/utils/age.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { ChevronRight } from '@lucide/svelte';
	import { publicMediaUrl } from '#lib/media/urls.ts';
	import { getAdoptionTone } from '#lib/utils/adoption.ts';
	import { ADOPTION_TONE } from '#lib/constants/adoption.ts';

	const {
		cat,
		onclick,
		isSelected = false
	}: { cat: CatFull; onclick: () => void; isSelected?: boolean } = $props();

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
	const activeSicknessesCount = $derived(
		cat.sicknesses.filter((s) => s.status !== 'RESOLVED').length
	);
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
	{onclick}
>
	<Table.Cell>
		<img
			src={imageSrc}
			alt={cat.name ?? cat.catNumber}
			loading="lazy"
			class="size-9 rounded-full object-cover sm:size-12"
			style={imageStyle}
		/>
	</Table.Cell>

	<!-- Num : sa propre colonne à partir de 640 px -->
	<Table.Cell class="hidden text-xs sm:table-cell">{cat.catNumber}</Table.Cell>

	<!-- Nom (+ numéro dessous sur mobile) -->
	<Table.Cell class="max-w-28 font-medium sm:max-w-40" title={tone?.label}>
		<span class="block truncate {tone?.textClass ?? ''}">{cat.name ?? 'Sans nom'}</span>
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

	<Table.Cell class="w-6 px-0 text-muted-foreground sm:hidden">
		<ChevronRight class="size-4" />
	</Table.Cell>
</Table.Row>
