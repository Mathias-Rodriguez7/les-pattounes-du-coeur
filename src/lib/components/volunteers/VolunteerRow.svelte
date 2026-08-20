<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '$lib/components/Icon.svelte';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { truncate } from '$lib/utils/string';

	const { volunteer, isSelected = false, onclick } = $props();

	const fullName = $derived(`${volunteer.profil.firstName} ${volunteer.profil.lastName}`);
	const catsCount = $derived(volunteer.cats.length);
	const formsCount = $derived(volunteer.assignedForms.length);

	// Couleurs pour les rôles
	const roleColors: Record<string, string> = {
		ADMIN: 'bg-red-100 text-red-800',
		MANAGER: 'bg-blue-100 text-blue-800',
		COMMUNICATION: 'bg-purple-100 text-purple-800'
	};

	// Icônes et couleurs pour le statut
	const statusConfig: Record<string, { icon: string; color: string }> = {
		ACTIVE: { icon: 'CirclePlay', color: 'text-green-600' },
		BREAK: { icon: 'CirclePause', color: 'text-gray-500' },
		STOP: { icon: 'CircleX', color: 'text-red-600' }
	};

	const statusIcon = $derived(
		statusConfig[volunteer.actif] || { icon: 'HelpCircle', color: 'text-gray-500' }
	);
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-16 cursor-pointer transition-colors"
	{onclick}
>
	<Table.Cell>
		<Icon
			name={statusIcon.icon}
			class="h-6 w-6 {statusIcon.color}"
			title={volunteer.actif === 'ACTIVE'
				? 'En activité'
				: volunteer.actif === 'BREAK'
					? 'En pause'
					: 'Arrêté'}
		/>
	</Table.Cell>
	<Table.Cell class="font-medium">{fullName}</Table.Cell>
	<Table.Cell>
		<Badge class={roleColors[volunteer.role] || 'bg-gray-100 text-gray-800'} title={volunteer.role}>
			{truncate(volunteer.role, 5)}
		</Badge>
	</Table.Cell>

	<Table.Cell>
		{#if volunteer.profil.city === 'Montpellier' && volunteer.profil.district}
			{DISTRICT_LABELS[volunteer.profil.district]}
		{:else if volunteer.profil.city !== 'Montpellier'}
			{volunteer.profil.city}
		{:else}
			—
		{/if}
	</Table.Cell>

	<Table.Cell class="text-center">
		<div class="flex items-center justify-center gap-1">
			{catsCount}
		</div>
	</Table.Cell>
	<Table.Cell class="text-center">
		<div class="flex items-center justify-center gap-1">
			{formsCount}
		</div>
	</Table.Cell>
</Table.Row>
