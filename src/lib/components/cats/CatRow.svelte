<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import Icon from '$lib/components/Icon.svelte';
	import type { CatFull } from '$lib/types/cat';
	import { focalPointClass, getSexIcon } from '$lib/utils/catHelpers';
	import { getAgeBadge } from '$lib/utils/age';
	import { Badge } from '$lib/components/ui/badge';

	const {
		cat,
		onclick,
		isSelected = false
	}: { cat: CatFull; onclick: () => void; isSelected?: boolean } = $props();

	const sexIcon = getSexIcon(cat.sex);

	// Récupère les maladies actives
	const activeSicknesses = cat.sicknesses.filter((s) => s.status !== 'RESOLVED');
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} cursor-pointer transition-colors"
	{onclick}
>
	<Table.Cell>
		<img
			src={cat.media?.[0]?.picture ?? '/img/logo.png'}
			alt={cat.name ?? 'Sans nom'}
			class="h-12 w-12 rounded-full object-cover {focalPointClass[cat.focalPointX ?? 'MID']}"
		/>
	</Table.Cell>
	<Table.Cell class="text-xs">{cat.catNumber}</Table.Cell>
	<Table.Cell class="font-medium">{cat.name ?? 'Sans nom'}</Table.Cell>
	<Table.Cell class="text-center">
		<div title={sexIcon.label}>
			<Icon name={sexIcon.icon} class="h-6 w-6 {sexIcon.color}" />
		</div>
	</Table.Cell>
	<Table.Cell class="text-sm">{getAgeBadge(cat.birthDate)}</Table.Cell>
	<Table.Cell>
		{#if activeSicknesses.length > 0}
			<div class="flex items-center gap-2">
				<Badge variant="outline" class="text-xs">{activeSicknesses.length}</Badge>
			</div>
		{:else}
			<span class="text-muted-foreground text-xs">Aucune maladie</span>
		{/if}
	</Table.Cell>
</Table.Row>
