<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '$lib/components/Icon.svelte';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import BooleanIcon from '../icons/BooleanIcon.svelte';
	import { truncate } from '$lib/utils/string';

	const { host, isSelected = false, onclick } = $props();

	const fullName = $derived(`${host.profil.firstName} ${host.profil.lastName}`);
	const placementsCount = $derived(host.placements?.length || 0);
	const location = $derived(
		host.profil.city === 'Montpellier' && host.profil.district
			? DISTRICT_LABELS[host.profil.district as keyof typeof DISTRICT_LABELS]
			: host.profil.city !== 'Montpellier'
				? host.profil.city
				: '—'
	);

	// Couleurs pour les types
	const typesColors: Record<string, { label: string; color: string }> = {
		CLASSIC: { label: 'Long', color: 'bg-purple-100 text-purple-800' },
		RELAY: { label: 'Cour', color: 'bg-pink-100 text-pink-800' }
	};

	// Icônes et couleurs pour l'activité
	const actifConfig: Record<string, { icon: string; color: string; label: string }> = {
		ACTIVE: { icon: 'CirclePlay', color: 'text-emerald-600', label: 'Actif' },
		BREAK: { icon: 'CirclePause', color: 'text-gray-500', label: 'En pause' },
		STOP: { icon: 'CircleX', color: 'text-red-600', label: 'Arrêté' }
	};

	const actifConfig_item = $derived(
		actifConfig[host.actif] || { icon: 'HelpCircle', color: 'text-gray-500', label: 'Inconnu' }
	);

	// Labels pour l'espace
	const spaceLabels: Record<string, string> = {
		SMALL: 'S',
		MEDIUM: 'M',
		LARGE: 'L'
	};

	// Compatibilités
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-16 cursor-pointer transition-colors"
	{onclick}
>
	<!-- Icône Activité -->
	<Table.Cell>
		<div title={actifConfig_item.label}>
			<Icon name={actifConfig_item.icon} class="h-6 w-6 {actifConfig_item.color}" />
		</div>
	</Table.Cell>

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

	<!-- Quartier / Ville -->
	<Table.Cell class="text-sm text-gray-600" title={location}>
		{truncate(location, 8)}
	</Table.Cell>

	<!-- Espace -->
	<Table.Cell class="text-center text-sm">
		{spaceLabels[host.space] || host.space || '—'}
	</Table.Cell>

	<!-- Nombre de chats en placement -->
	<Table.Cell class="text-center">
		<span class="inline-flex items-center justify-center rounded-full text-sm font-medium">
			{placementsCount}
		</span>
	</Table.Cell>

	<!-- Icône Jardin -->
	<Table.Cell class="text-center">
		<BooleanIcon value={host.outside} />
	</Table.Cell>
</Table.Row>
