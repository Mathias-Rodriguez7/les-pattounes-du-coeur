<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { typesColors } from '$lib/constants/news.js';
	import { truncate } from '$lib/utils/string';
	import { formatDateNum } from '$lib/utils/date';

	let { news, onclick, isSelected = false } = $props();
</script>

<Table.Row
	class="{isSelected
		? 'bg-accent hover:bg-accent'
		: 'hover:bg-muted/50'} h-14 cursor-pointer transition-colors"
	{onclick}
>
	<Table.Cell class="max-w-48 truncate font-medium">{truncate(news.title, 20)}</Table.Cell>
	<Table.Cell>
		<Badge class={typesColors[news.type]?.color}>{typesColors[news.type]?.label || news.type}</Badge
		>
	</Table.Cell>
	<Table.Cell class="whitespace-nowrap">{formatDateNum(news.created_at)}</Table.Cell>
</Table.Row>
