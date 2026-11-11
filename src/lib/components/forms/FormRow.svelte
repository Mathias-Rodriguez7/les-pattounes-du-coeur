<script lang="ts">
	import * as Table from '#lib/components/ui/table/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { statusColors, typesLabels } from '#lib/constants/forms.ts';
	import { formatDateNum } from '#lib/utils/date.ts';

	let { form, isSelected = false, onclick } = $props();

	const assignedName = $derived(
		form.assignedTo
			? `${form.assignedTo.profil.firstName} ${form.assignedTo.profil.lastName}`
			: 'Non assigné'
	);
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
	{onclick}
>
	<Table.Cell>
		<Badge class={typesLabels[form.type]?.color || 'bg-gray-100 text-gray-800'}>
			{typesLabels[form.type]?.label || form.type}
		</Badge>
	</Table.Cell>
	<Table.Cell>
		<Badge class={statusColors[form.status]?.color || 'bg-gray-100 text-gray-800'}>
			{statusColors[form.status]?.label || form.status}
		</Badge>
		{#if form.blacklist}
			<Badge class="mt-1 bg-red-100 text-red-700" title={form.blacklist.reason}>Liste noire</Badge>
		{/if}
	</Table.Cell>
	<!-- Téléphone : colonne masquée, pour garder Type, Statut et Date lisibles -->
	<Table.Cell class="hidden sm:table-cell">
		<span class="text-sm text-muted-foreground">{assignedName}</span>
	</Table.Cell>
	<Table.Cell>
		<span class="text-sm text-muted-foreground">{formatDateNum(form.createdAt)}</span>
	</Table.Cell>
</Table.Row>
