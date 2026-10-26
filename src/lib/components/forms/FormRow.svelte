<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { statusColors, typesLabels } from '$lib/constants/forms';
	import { formatDateNum } from '$lib/utils/date';

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
	</Table.Cell>
	<Table.Cell>
		<span class="text-muted-foreground text-sm">{assignedName}</span>
	</Table.Cell>
	<Table.Cell>
		<span class="text-muted-foreground text-sm">{formatDateNum(form.createdAt)}</span>
	</Table.Cell>
</Table.Row>
