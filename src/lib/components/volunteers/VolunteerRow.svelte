<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { truncate } from '$lib/utils/string';

	const { volunteer, isSelected = false, onclick } = $props();

	const fullName = $derived(`${volunteer.profil.firstName} ${volunteer.profil.lastName}`);
	const catsCount = $derived(volunteer.cats.length);
	const formsCount = $derived(volunteer.assignedForms.length);
	const isDistrict = $derived(volunteer.profil.city === 'Montpellier' && volunteer.profil.district);
	const location = $derived(
		volunteer.profil.city === 'Montpellier' && volunteer.profil.district
			? DISTRICT_LABELS[volunteer.profil.district as keyof typeof DISTRICT_LABELS]
			: volunteer.profil.city !== 'Montpellier'
				? volunteer.profil.city
				: '—'
	);

	const locationBadgeClass = $derived(
		isDistrict
			? 'bg-amber-100 text-amber-800' // Quartier
			: 'bg-emerald-100 text-emerald-800' // Ville
	);

	// Couleurs pour les rôles
	const roleColors: Record<string, string> = {
		ADMIN: 'bg-red-100 text-red-800',
		MANAGER: 'bg-blue-100 text-blue-800',
		COMMUNICATION: 'bg-purple-100 text-purple-800'
	};

	const locationLabel = $derived(isDistrict ? '📍 Quartier' : '🌍 Ville');
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-16 cursor-pointer transition-colors"
	{onclick}
>
	<Table.Cell class="font-semibold text-gray-900" title={fullName}>
		{truncate(fullName, 10)}
	</Table.Cell>
	<Table.Cell>
		<Badge class={roleColors[volunteer.role] || 'bg-gray-100 text-gray-800'} title={volunteer.role}>
			{truncate(volunteer.role, 3)}
		</Badge>
	</Table.Cell>

	<!-- ✅ Location badge avec couleur dynamique -->
	<Table.Cell class="text-sm text-gray-600" title={location}>
		<Badge class={locationBadgeClass} title={locationLabel}>
			{truncate(location, 6)}
		</Badge>
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
