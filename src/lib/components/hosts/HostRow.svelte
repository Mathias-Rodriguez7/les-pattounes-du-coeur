<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import BooleanIcon from '../icons/BooleanIcon.svelte';
	import { truncate } from '$lib/utils/string';
	import { typesColors, healColors, socializeColors } from '$lib/constants/host';

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
	<!-- Nom Complet -->
	<Table.Cell class="font-semibold text-gray-900" title={fullName}>
		{truncate(fullName, 8)}
	</Table.Cell>

	<!-- Type (CLASSIC/RELAY) -->
	<Table.Cell>
		<Badge class={typesColors[host.type]?.color || 'bg-gray-100 text-gray-800'}>
			{typesColors[host.type]?.label || host.type}
		</Badge>
	</Table.Cell>

	<!-- animaux dans le foyer -->
	<Table.Cell class="text-center">
		<BooleanIcon value={host.hasAnimalsAtHome} />
	</Table.Cell>

	<!-- Socia -->
	<Table.Cell class="text-sm">
		<Badge class={socializeColors[host.socialize]?.color || 'bg-gray-100 text-gray-800'}>
			{socializeColors[host.socialize]?.label || host.socialize}
		</Badge>
	</Table.Cell>

	<!-- Soin -->
	<Table.Cell class="text-center text-sm">
		<Badge class={healColors[host.heal]?.color || 'bg-gray-100 text-gray-800'}>
			{healColors[host.heal]?.label || host.heal}
		</Badge>
	</Table.Cell>

	<!-- Nombre de chats en placement -->
	<Table.Cell class="text-center">
		<span class="inline-flex items-center justify-center rounded-full text-sm font-medium">
			{placementsCount}
		</span>
	</Table.Cell>

	<!-- Icône exterieur -->
	<Table.Cell class="text-center">
		<BooleanIcon value={host.outside} />
	</Table.Cell>
</Table.Row>
