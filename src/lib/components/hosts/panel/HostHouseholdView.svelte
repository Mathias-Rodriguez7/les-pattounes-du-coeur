<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import {
		HOUSEHOLD_FIELDS,
		isHouseholdUnknown,
		type HouseholdData
	} from '#lib/hosts/household.ts';

	// La composition du foyer, en lecture : fiche d'une FA, demande FA, candidature
	let { data }: { data: HouseholdData } = $props();
</script>

<SectionCard
	icon={HOST_SECTION_CONFIG.household.icon}
	title={HOST_SECTION_CONFIG.household.label}
	color={HOST_SECTION_CONFIG.household.color}
>
	{#if isHouseholdUnknown(data)}
		<p class="text-xs text-muted-foreground italic">Non renseignée</p>
	{:else}
		<div class="space-y-1 text-xs">
			{#each HOUSEHOLD_FIELDS as field (field.key)}
				<div class="flex items-center justify-between" title={field.hint}>
					<span class="text-sm">{field.label}</span>
					<Badge variant="outline" class="h-fit text-xs">{data[field.key] ?? 0}</Badge>
				</div>
			{/each}
		</div>
	{/if}
</SectionCard>
