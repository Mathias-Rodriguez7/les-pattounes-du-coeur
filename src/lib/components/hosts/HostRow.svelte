<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import BooleanIcon from '../icons/BooleanIcon.svelte';
	import { typesColors, healColors, socializeColors } from '$lib/constants/host';
	import { ChevronRight } from '@lucide/svelte';

	const { host, isSelected = false, onclick } = $props();

	const fullName = $derived(`${host.profil.firstName} ${host.profil.lastName}`);
	const placementsCount = $derived(host.placements?.length || 0);
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
	{onclick}
>
	<Table.Cell class="max-w-36 truncate font-semibold text-gray-900" title={fullName}>
		{fullName}
	</Table.Cell>

	<Table.Cell>
		<Badge class={typesColors[host.type]?.color || 'bg-gray-100 text-gray-800'}>
			{typesColors[host.type]?.label || host.type}
		</Badge>
	</Table.Cell>

	<Table.Cell class="hidden text-center sm:table-cell">
		<BooleanIcon value={host.hasAnimalsAtHome} />
	</Table.Cell>

	<Table.Cell class="hidden text-sm sm:table-cell">
		<Badge class={socializeColors[host.socialize]?.color || 'bg-gray-100 text-gray-800'}>
			{socializeColors[host.socialize]?.label || host.socialize}
		</Badge>
	</Table.Cell>

	<Table.Cell class="hidden text-center text-sm sm:table-cell">
		<Badge class={healColors[host.heal]?.color || 'bg-gray-100 text-gray-800'}>
			{healColors[host.heal]?.label || host.heal}
		</Badge>
	</Table.Cell>

	<Table.Cell class="hidden text-center text-sm font-medium sm:table-cell">
		{placementsCount}
	</Table.Cell>

	<Table.Cell class="hidden text-center sm:table-cell">
		<BooleanIcon value={host.outside} />
	</Table.Cell>

	<Table.Cell class="text-muted-foreground w-8 sm:hidden">
		<ChevronRight class="size-4" />
	</Table.Cell>
</Table.Row>
