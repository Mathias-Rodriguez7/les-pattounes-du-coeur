<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { districtLabel } from '#lib/utils/districts.ts';
	import { truncate } from '#lib/utils/string.ts';
	import { roleColors } from '#lib/constants/volunteer.ts';
	import { ChevronRight } from '@lucide/svelte';
	import { TASK_URGENCY } from '#lib/constants/tasks.ts';
	import { countByUrgency } from '#lib/tasks/board.ts';
	import type { Task } from '#lib/tasks/tasks.ts';
	import type { VolunteerWithRelations } from '#lib/types/volunteer.ts';

	const {
		volunteer,
		isSelected = false,
		onclick,
		tasks = []
	}: {
		volunteer: VolunteerWithRelations;
		isSelected?: boolean;
		onclick: () => void;
		/** Ce qu'elle a à faire (colonne « À faire ») */
		tasks?: Task[];
	} = $props();

	const taskCounts = $derived(countByUrgency(tasks));

	const fullName = $derived(`${volunteer.profil.firstName} ${volunteer.profil.lastName}`);
	const catsCount = $derived(volunteer.cats.length);
	const formsCount = $derived(volunteer.assignedForms.length);
	const isDistrict = $derived(volunteer.profil.city === 'Montpellier' && volunteer.profil.district);
	const location = $derived(
		volunteer.profil.city === 'Montpellier' && volunteer.profil.district
			? districtLabel(volunteer.profil.district)
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
	data-row-id={volunteer.id}
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
		<!-- La ville en italique (en plus de sa couleur), le quartier en droit -->
		<Badge class="{locationBadgeClass} {isDistrict ? '' : 'italic'}" title={locationLabel}>
			{truncate(location, 6)}
		</Badge>
	</Table.Cell>

	<Table.Cell class="hidden text-center sm:table-cell">{catsCount}</Table.Cell>
	<Table.Cell class="hidden text-center sm:table-cell">{formsCount}</Table.Cell>

	<!-- À faire : ses tâches urgentes (rouge) et de la semaine (orange) -->
	<Table.Cell class="text-center">
		<div
			class="flex justify-center gap-1"
			title="{tasks.length} tâche{tasks.length > 1 ? 's' : ''}"
		>
			{#if taskCounts.URGENT > 0}
				<span class="rounded-md px-1.5 text-xs font-semibold {TASK_URGENCY.URGENT.color}">
					{taskCounts.URGENT}
				</span>
			{/if}
			{#if taskCounts.WEEK + taskCounts.WATCH > 0}
				<span class="rounded-md px-1.5 text-xs font-semibold {TASK_URGENCY.WEEK.color}">
					{taskCounts.WEEK + taskCounts.WATCH}
				</span>
			{/if}
			{#if tasks.length === 0}
				<span class="text-xs text-muted-foreground">—</span>
			{/if}
		</div>
	</Table.Cell>

	<!-- Flèche : indique sur mobile qu'on peut toucher la ligne -->
	<Table.Cell class="w-8 text-muted-foreground sm:hidden">
		<ChevronRight class="size-4" />
	</Table.Cell>
</Table.Row>
