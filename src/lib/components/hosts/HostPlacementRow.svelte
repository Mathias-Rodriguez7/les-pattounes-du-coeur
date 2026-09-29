<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import type { HostFull } from '$lib/types/host';
	import type { ColumnDef } from './columns';
	import {
		typesColors,
		healColors,
		socializeColors,
		statusColors,
		babyFeedingColors
	} from '$lib/constants/host';
	import { Badge } from '$lib/components/ui/badge';
	import BooleanIcon from '$lib/components/icons/BooleanIcon.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	interface Props {
		host: HostFull;
		columns: ColumnDef[];
		selected: boolean;
		onToggle: (hostId: string, checked: boolean) => void;
	}

	let { host, columns, selected, onToggle }: Props = $props();

	function renderCell(col: ColumnDef) {
		return col.accessor(host);
	}
</script>

<Table.Row
	class="{selected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} cursor-pointer transition-colors"
	onclick={() => onToggle(host.id, !selected)}
>
	<Table.Cell class="w-10" onclick={(e) => e.stopPropagation()}>
		<Checkbox checked={selected} onCheckedChange={(checked) => onToggle(host.id, !!checked)} />
	</Table.Cell>

	{#each columns as col (col.id)}
		<Table.Cell>
			{#if col.id === 'type'}
				<Badge class={typesColors[host.type]?.color ?? 'bg-gray-100 text-gray-800'}>
					{typesColors[host.type]?.label ?? host.type}
				</Badge>
			{:else if col.id === 'heal'}
				<Badge class={healColors[host.heal]?.color ?? 'bg-gray-100 text-gray-800'}>
					{healColors[host.heal]?.label ?? host.heal}
				</Badge>
			{:else if col.id === 'socialize'}
				<Badge class={socializeColors[host.socialize]?.color ?? 'bg-gray-100 text-gray-800'}>
					{socializeColors[host.socialize]?.label ?? host.socialize}
				</Badge>
			{:else if col.id === 'actif'}
				<Badge class={statusColors[host.actif]?.color ?? 'bg-gray-100 text-gray-800'}>
					{statusColors[host.actif]?.label ?? host.actif}
				</Badge>
			{:else if col.id === 'babyFeeding'}
				<Badge class={babyFeedingColors[host.babyFeeding]?.color ?? 'bg-gray-100 text-gray-800'}>
					{babyFeedingColors[host.babyFeeding]?.label ?? host.babyFeeding}
				</Badge>
			{:else if col.id === 'isAvailable' || col.id === 'outside' || col.id === 'car' || col.id === 'isStockFeed'}
				<BooleanIcon value={renderCell(col)} />
			{:else}
				{renderCell(col)}
			{/if}
		</Table.Cell>
	{/each}
</Table.Row>
