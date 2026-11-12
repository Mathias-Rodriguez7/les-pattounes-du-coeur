<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import * as Accordion from '#lib/components/ui/accordion/index.ts';
	import CatPlacementCard from './CatPlacementCard.svelte';
	import type { CatFull } from '#lib/types/cat.ts';

	// Historique des placements du chat (terminés), le plus récent en haut, replié par défaut
	interface Props {
		cat: CatFull;
	}

	let { cat }: Props = $props();

	const stoppedPlacements = $derived(
		cat.placements
			.filter((p) => p.status === 'STOP')
			.sort((a, b) => {
				const dateA = new Date(a.endDate ?? a.startDate ?? 0).getTime();
				const dateB = new Date(b.endDate ?? b.startDate ?? 0).getTime();
				return dateB - dateA;
			})
	);
</script>

<Accordion.Root type="single">
	<Accordion.Item value="history" class="border-0">
		<Accordion.Trigger class="py-2 text-base font-semibold hover:no-underline sm:text-lg">
			<div class="flex items-center gap-2">
				<Icon name="history" class="h-5 w-5 text-slate-600" />
				<span>Historique des placements</span>
				<Badge variant="secondary" class="ml-2">{stoppedPlacements.length}</Badge>
			</div>
		</Accordion.Trigger>
		<Accordion.Content>
			{#if stoppedPlacements.length > 0}
				<div class="grid gap-2">
					{#each stoppedPlacements as placement (placement.id)}
						<CatPlacementCard {placement} {cat} isHistory />
					{/each}
				</div>
			{:else}
				<p class="py-2 text-sm text-muted-foreground">Aucun placement terminé.</p>
			{/if}
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
