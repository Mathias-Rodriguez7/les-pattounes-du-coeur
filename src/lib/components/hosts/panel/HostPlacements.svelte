<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import PlacementCard from '#lib/components/PlacementCard.svelte';
	import { HOST_SECTION_CONFIG } from '#lib/constants/host.ts';
	import { PLACEMENT_TYPE_COLORS, PLACEMENT_TYPE_LABELS } from '#lib/constants/placement.ts';
	import type { HostFull, HostPlacement } from '#lib/types/host.ts';

	// Les chats actuellement placés chez une FA, par type de placement
	interface Props {
		host: HostFull;
	}

	let { host }: Props = $props();

	const isActive = (p: HostPlacement) => p.status === 'ACTIVE' || p.status === 'BREAK';

	// Chaque liste est calculée UNE fois
	const activePlacements = $derived(host.placements.filter(isActive));
	const proposalPlacements = $derived(activePlacements.filter((p) => p.type === 'PROPOSAL'));
	const transferPlacements = $derived(activePlacements.filter((p) => p.type === 'TRANSFER'));
	const longShortPlacements = $derived(
		activePlacements.filter((p) => p.type === 'LONG' || p.type === 'SHORT')
	);
</script>

<!-- Une colonne de placements actifs (même rendu qu'avant, écrit une seule fois) -->
{#snippet placementColumn(
	title: string,
	dotClass: string,
	textClass: string,
	list: HostPlacement[]
)}
	<div class="space-y-3">
		<h4 class="flex items-center gap-2 text-sm font-semibold {textClass}">
			<span class="h-3 w-3 rounded-full {dotClass}"></span>
			{title}
		</h4>
		<div class="space-y-2">
			{#each list as placement (placement.id)}
				<PlacementCard {placement} />
			{:else}
				<p class="text-xs text-gray-500 italic">Aucun</p>
			{/each}
		</div>
	</div>
{/snippet}

<section class="space-y-8">
	<SectionCard
		icon={HOST_SECTION_CONFIG.placements.icon}
		title={HOST_SECTION_CONFIG.placements.label}
		color={HOST_SECTION_CONFIG.placements.color}
	>
		{#if activePlacements.length > 0}
			<div>
				<h3 class="mb-4 text-lg font-semibold text-gray-900">Placements actifs</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
					{@render placementColumn(
						PLACEMENT_TYPE_LABELS.PROPOSAL,
						PLACEMENT_TYPE_COLORS.PROPOSAL.dot,
						PLACEMENT_TYPE_COLORS.PROPOSAL.text,
						proposalPlacements
					)}
					{@render placementColumn(
						PLACEMENT_TYPE_LABELS.TRANSFER,
						PLACEMENT_TYPE_COLORS.TRANSFER.dot,
						PLACEMENT_TYPE_COLORS.TRANSFER.text,
						transferPlacements
					)}
					{@render placementColumn(
						'Accueil (Long/Relais)',
						PLACEMENT_TYPE_COLORS.LONG.dot,
						PLACEMENT_TYPE_COLORS.LONG.text,
						longShortPlacements
					)}
				</div>
			</div>
		{:else}
			<div
				class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12"
			>
				<Icon name="FileText" class="mb-2 h-8 w-8 text-muted-foreground opacity-50" />
				<p class="text-sm text-muted-foreground">Aucun placement pour cet accueillant</p>
			</div>
		{/if}
	</SectionCard>
</section>
