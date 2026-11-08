<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import type { CatFull } from '$lib/types/cat';
	import { focalPointStyle, getSexIcon } from '$lib/utils/catHelpers';
	import { getAgeBadge } from '$lib/utils/age';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronRight } from '@lucide/svelte';
	import { publicMediaUrl } from '$lib/media/urls';

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
	<Table.Cell class="max-w-28 font-medium sm:max-w-40">
		<span class="block truncate">{cat.name ?? 'Sans nom'}</span>
		<span class="text-muted-foreground block text-xs sm:hidden">{cat.catNumber}</span>
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
			<span class="text-muted-foreground text-xs">
				<span class="sm:hidden">—</span>
				<span class="hidden sm:inline">Aucune</span>
			</span>
		{/if}
	</Table.Cell>

	<Table.Cell class="text-muted-foreground w-6 px-0 sm:hidden">
		<ChevronRight class="size-4" />
	</Table.Cell>
</Table.Row>
