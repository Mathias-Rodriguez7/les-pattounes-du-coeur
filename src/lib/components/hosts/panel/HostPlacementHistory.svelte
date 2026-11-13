<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import PlacementCard from '#lib/components/PlacementCard.svelte';
	import * as Accordion from '#lib/components/ui/accordion/index.ts';
	import type { HostFull } from '#lib/types/host.ts';

	// Historique des placements terminés d'une FA, replié par défaut
	interface Props {
		host: HostFull;
	}

	let { host }: Props = $props();

	// Les placements longs et relais terminés
	const historicalPlacements = $derived(
		host.placements.filter((p) => p.status === 'STOP' && (p.type === 'LONG' || p.type === 'SHORT'))
	);
</script>

<section class="mt-6">
	<Accordion.Root type="single">
		<Accordion.Item value="history">
			<Accordion.Trigger class="py-4 text-base font-semibold hover:no-underline sm:text-lg">
				<div class="flex items-center gap-2">
					<Icon name="history" class="h-5 w-5 text-slate-600" />
					<span>Historique des placements</span>
					<Badge variant="secondary" class="ml-2">
						{historicalPlacements.length}
					</Badge>
				</div>
			</Accordion.Trigger>
			<Accordion.Content>
				<div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
					{#each historicalPlacements as placement (placement.id)}
						<PlacementCard {placement} isHistory={true} />
					{/each}
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</section>
