<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { DISTRICT_LABELS } from '$lib/utils/districts';
	import { truncate } from '$lib/utils/string';
	import { roleColors } from '$lib/constants/volunteer';
	import { ChevronRight } from '@lucide/svelte';

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
		isDistrict ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
	);
	const locationLabel = $derived(isDistrict ? '📍 Quartier' : '🌍 Ville');
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
	{onclick}
>
	<!-- Nom : tronqué par le CSS (s'adapte à la largeur) plutôt qu'à 10 caractères fixes -->
	<Table.Cell class="max-w-40 truncate font-semibold text-gray-900" title={fullName}>
		{fullName}
	</Table.Cell>

	<Table.Cell>
		<Badge class={roleColors[volunteer.role] || 'bg-gray-100 text-gray-800'} title={volunteer.role}>
			{truncate(volunteer.role, 3)}
		</Badge>
	</Table.Cell>

	<Table.Cell class="hidden text-sm text-gray-600 sm:table-cell" title={location}>
		<Badge class={locationBadgeClass} title={locationLabel}>
			{truncate(location, 6)}
		</Badge>
	</Table.Cell>

	<Table.Cell class="hidden text-center sm:table-cell">{catsCount}</Table.Cell>
	<Table.Cell class="hidden text-center sm:table-cell">{formsCount}</Table.Cell>

	<!-- Flèche : indique sur mobile qu'on peut toucher la ligne -->
	<Table.Cell class="text-muted-foreground w-8 sm:hidden">
		<ChevronRight class="size-4" />
	</Table.Cell>
</Table.Row>
