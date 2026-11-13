<script lang="ts">
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import PlacementCreateForm from '#lib/components/placements/PlacementCreateForm.svelte';
	import CatPlacementCard from './CatPlacementCard.svelte';
	import { CAT_SECTION_CONFIG } from '#lib/constants/cat.ts';
	import { PLACEMENT_TYPE_LABELS } from '#lib/constants/placement.ts';
	import type { PlacementType } from '@prisma/client';
	import type { CatFull, CatPlacement } from '#lib/types/cat.ts';
	import type { HostFull } from '#lib/types/host.ts';

	// Section « Familles d'accueil » de la fiche d'un chat : les placements EN COURS, par type
	interface Props {
		cat: CatFull;
		/** Toutes les FA : la liste du bouton « Placer » */
		hosts: HostFull[];
		/** Seule l'admin crée ou modifie un placement */
		isAdmin: boolean;
	}

	let { cat, hosts, isAdmin }: Props = $props();

	const activePlacements = $derived(
		cat.placements.filter(
			(p) =>
				(p.type === 'LONG' && (p.status === 'ACTIVE' || p.status === 'BREAK')) ||
				(p.type === 'SHORT' && p.status === 'ACTIVE') ||
				(p.type === 'PROPOSAL' && p.status === 'ACTIVE') ||
				(p.type === 'TRANSFER' && p.status === 'ACTIVE')
		)
	);

	const activeProposalPlacements = $derived(activePlacements.filter((p) => p.type === 'PROPOSAL'));
	const activeTransferPlacements = $derived(activePlacements.filter((p) => p.type === 'TRANSFER'));
	const activeLongPlacement = $derived(activePlacements.find((p) => p.type === 'LONG') ?? null);
	const activeShortPlacement = $derived(activePlacements.find((p) => p.type === 'SHORT') ?? null);
</script>

<!-- Un groupe de placements d'un même type, avec son titre (rien si le groupe est vide) -->
{#snippet placementGroup(type: PlacementType, list: CatPlacement[])}
	{#if list.length > 0}
		<div class="grid gap-2">
			<span class="block text-xs text-muted-foreground">FA ({PLACEMENT_TYPE_LABELS[type]})</span>
			{#each list as placement (placement.id)}
				<CatPlacementCard {placement} {cat} canEdit={isAdmin} />
			{/each}
		</div>
	{/if}
{/snippet}

<SectionCard
	icon={CAT_SECTION_CONFIG.host.icon}
	title={CAT_SECTION_CONFIG.host.label}
	color={CAT_SECTION_CONFIG.host.color}
>
	{#snippet action()}
		{#if isAdmin}
			<PlacementCreateForm catId={cat.id} {cat} {hosts} />
		{/if}
	{/snippet}

	{#if activePlacements.length > 0}
		<div class="ml-0 grid gap-4 sm:ml-6">
			{@render placementGroup('PROPOSAL', activeProposalPlacements)}
			{@render placementGroup('TRANSFER', activeTransferPlacements)}
			{@render placementGroup('LONG', activeLongPlacement ? [activeLongPlacement] : [])}
			{@render placementGroup('SHORT', activeShortPlacement ? [activeShortPlacement] : [])}
		</div>
	{:else}
		<div class="flex items-center justify-center rounded-xl border-2 border-dotted p-4">
			<p>Aucune FA associée à ce chat</p>
		</div>
	{/if}
</SectionCard>
