<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import BooleanIcon from '../icons/BooleanIcon.svelte';
	import { truncate } from '$lib/utils/string';

	const { host, isSelected = false, onclick } = $props();

	const fullName = $derived(`${host.profil.firstName} ${host.profil.lastName}`);
	const placementsCount = $derived(host.placements?.length || 0);

	// Couleurs pour les types
	const typesColors: Record<string, { label: string; color: string }> = {
		CLASSIC: { label: 'Lon', color: 'bg-purple-100 text-purple-800' },
		SOS: { label: 'Sos', color: 'bg-orange-100 text-orange-800' },
		ADOPT: { label: 'Ado', color: 'bg-green-100 text-green-800' },
		PROPRIO: { label: 'Pro', color: 'bg-cyan-100 text-cyan-800' },
		RELAY: { label: 'Rel', color: 'bg-pink-100 text-pink-800' }
	};

	// Couleur pour les soins
	const healColors: Record<string, { label: string; color: string }> = {
		NO: { label: 'Non', color: 'bg-red-100 text-red-800' },
		LIGHT: { label: 'Léger', color: 'bg-orange-100 text-orange-800' },
		HEAVY: { label: 'Lourd', color: 'bg-green-100 text-green-800' },
		HEAVY_STING: { label: 'Lourd+', color: 'bg-cyan-100 text-cyan-800' }
	};

	// Couleur pour les socia
	const socializeColors: Record<string, { label: string; color: string }> = {
		NO: { label: 'Non', color: 'bg-red-100 text-red-800' },
		FEARFUL: { label: 'Cra', color: 'bg-orange-100 text-orange-800' },
		WITHOUT_EX: { label: 'XP-', color: 'bg-green-100 text-green-800' },
		EXPERIENCED: { label: 'XP+', color: 'bg-cyan-100 text-cyan-800' }
	};
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-16 cursor-pointer transition-colors"
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
